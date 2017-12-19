wants = ['4b240000', 'f3270000', '632f0000', 'b3460000', 'f3bc0000', '33fe0000', '332c0300', '33530700', '47270000', '43270000', '77310000', '33440000', 'a3800000', '73de0000', '735a0100', '338b0300', '33e80700', '33970700', 'fc260000', 'ab2d0000', '5b430000', '43510000', 'a3800000', '33fe0000', '736e0100', '33440500', '33ba0500', '33130b00', '212b0000', 'ab320000', '0b470000', '338e0000', 'd3fd0000', '73f30000', 'b3aa0200', '33690500', '33bf0f00', '333f2500']

for i,want in enumerate(wants):
    calc_by_iters = (i+1) * pow(2, (i+2) % 10)
    num = int(want[6:] + want[4:6] + want[2:4] + want[:2], 16)
    ch = (num - 9011) // calc_by_iters
    print(chr(ch), end='')
print('')