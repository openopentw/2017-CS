import string
import subprocess
import sys

from collections import Counter
from sys import argv
from os import path

def call_bash(cmd_list, input):
    res = subprocess.run(cmd_list, input=input, stdout=subprocess.PIPE)
    if res.stderr != None:
        print('==== STDERR!! ====')
        print(res.stderr)
        print('==================')
    return res.stdout

# file paths
# pin_root_path =  '~/download/pin'
if len(argv) < 2:
    print('Please give me the root folder of pintool by argv.')
    sys.exit()
else:
    pin_root_path =  argv[1]

pin_path =  path.join(pin_root_path, 'pin')
pin_so_path = path.join(pin_root_path, 'source/tools/ManualExamples/obj-intel64/inscount0.so')
ins_cnt_path = './inscount.out'
binary_path = './break'

def rec_inscount(input):
    out = call_bash([pin_path, '-t', pin_so_path, '--', binary_path], input)

    if out == b'Pass\n':
        print('==== SUCCESS!! ====')
        print('out:', out)
        print('FLAG:', input)
        print('===================')
        sys.exit()
    elif out != b'Fails!\n':
        print('==== DIFFERENT OUTPUT?? ====')
        print('ans:')
        print(input)
        print('out')
        print(out)
        print('============================')

    with open(ins_cnt_path) as f:
        inscount = int(f.read().split()[1])
    return inscount

ans = ''
# ans = 'CTF{PinADXAnInterfaceforCustomizableDebuggingwithDynamicInstrumentatio'
guess_length = 0x48

for j in range(len(ans), guess_length):
    print('guessing the', hex(j), '/', hex(guess_length), 'th char...')
    candidate_chars = string.printable
    inscounts = []

    for i,ch in enumerate(candidate_chars):
        inscounts += [ rec_inscount((ans+ch).encode()) ]

    counter = Counter(inscounts)
    sorted_counter = sorted(counter.items())
    # print('Counter:', sorted_counter)
    if sorted_counter[-1][1] != 1:
        print('==== WARNING: not single path  ====')
        print('==== maybe try again? (Ctrl-C) ====')
        print('count:', sorted_counter[-1][1])
        print('===================================')
    inscount = sorted(counter.items())[-1][0]
    index = inscounts.index(inscount)
    # print('guess:', candidate_chars[index])

    ans += candidate_chars[index]
    print('guess ans:', ans)
    print('')
