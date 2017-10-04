// 型態      大小 (bytes)
// short       2
// int         4
// long        8
// float       4
// double      8
// long double 16
// char        1

#include <stdio.h>

typedef unsigned char   uint8;
#define _BYTE  uint8

int MY_CF_ADD(_BYTE x, _BYTE y)
{
	/* return uint8(x) > uint8(x+y); */
	return 0;
}

int encrypt(int str, int write_amount)
{
	puts("just after encrypt");
	printf("%s\n", str);

	int calc_by_iter;	// v4
	int char_in_str;	// v5
	int write_ptr;	// ptr

	int iter = 0;
	FILE *file_flag = fopen("flag", "wb");
	if ( write_amount )	// write_amount should not be 0
	{
		do
		{
			calc_by_iter = (iter + 1) << ((iter + 2) % 10);
			char_in_str = *(unsigned char *)(str + iter++);
			write_ptr = calc_by_iter * char_in_str + 9011;
			fwrite(&write_ptr, 4, 1, file_flag);
		}
		while ( iter != write_amount );
	}
	return fclose(file_flag);
}

int main()
{
	int str;
	memset(&str, 0, 60u);
	scanf("%60s", &str);

	int *str_iter;	// v6
	int char_in_str;	// v7
	unsigned int end_while;	// v8

	str_iter = &str;
	do {
		char_in_str = *str_iter;
		++str_iter;
		end_while = ~char_in_str & (char_in_str - 0x1010101) & 0x80808080;

	} while( !end_while );	// if end_while != 0: break

	_Bool change_strIter_or_not;	// v9	//change v6 or not
#define __int16 short
	change_strIter_or_not = (unsigned __int16)(end_while & 0x8080) == 0;

	if ( !(end_while & 0x8080) )	// if (end_while & 0x8080) == 0:
		end_while >>= 16;	// now end_while should be 0?
	if ( change_strIter_or_not )
		str_iter = (int *)((char *)str_iter + 2);

	puts("before encrypt");
	printf("%s\n", &str);

	encrypt((int)&str, (char *)str_iter +
			- MY_CF_ADD((_BYTE)end_while, (_BYTE)end_while)
			- 3 - (char *)str);

	return 0;
}
