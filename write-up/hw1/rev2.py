raw_flag = [0x8A, 0x80, 0x8D, 0x8B, 0xB7, 0x94, 0xFC, 0xBE, 0x93, 0xB8, 0xA3, 0x93, 0x8F, 0xBE, 0xF8, 0xAF, 0xA7, 0x93, 0x81, 0xFF, 0xB1]

flag = ''
for ch in raw_flag:
    flag += chr(ch ^ 0xCC)
print(flag)
