string = 'FLAG{Ioaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa}'
string = 'FLAG{Iost4SXskSmu53CbCAI5e52FBJkj1JKl}'

for i,ch in enumerate(string):
    calc_by_iter = (i+1) * pow(2, (i+2) % 10)
    num = calc_by_iter * ord(ch) + 9011

    output = hex(num)[2:].zfill(8)
    output = output[6:] + output[4:6] + ' ' + output[2:4] + output[:2]

    print(ch, end='\t')
    print(output)
