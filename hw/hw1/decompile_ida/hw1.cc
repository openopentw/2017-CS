#include <stdio.h>
#include <string.h>

typedef unsigned long long ull;

typedef          char   int8;
typedef unsigned char   uint8;
typedef unsigned short  uint16;
typedef unsigned int    uint32;
typedef ull             uint64;

#define __int16 short
#define _BYTE  uint8

// carry flag of addition (x+y)
template<class T, class U> int8 __CFADD__(T x, U y)
{
  int size = sizeof(T) > sizeof(U) ? sizeof(T) : sizeof(U);
  if ( size == 1 )
    return uint8(x) > uint8(x+y);
  if ( size == 2 )
    return uint16(x) > uint16(x+y);
  if ( size == 4 )
    return uint32(x) > uint32(x+y);
  return uint64(x) > uint64(x+y);
}


int encrypt(int scanf_string, int write_amount)
{
	int v4; // edx@2
	int v5; // eax@2
	int ptr; // [sp+14h] [bp-20h]@2

	int iter = 0;
	FILE *file_flag = fopen("flag", "wb");
	if ( write_amount )
	{
		do
		{
			v4 = (iter + 1) << (iter + 2) % 10u;
			v5 = *(_BYTE *)(scanf_string + iter++);
			ptr = v4 * v5 + 9011;
			fwrite(&ptr, 4u, 1u, file_flag);
		}
		while ( iter != write_amount );
	}
	return fclose(file_flag);
}

int main()
{
	int scanf_string; // [sp-5Ch] [bp-5Ch]@1
	memset(&scanf_string, 0, 60u);
	scanf("%60s", &scanf_string);

	int *v6; // edx@1
	int v7; // ecx@2
	unsigned int v8; // eax@2
	v6 = &scanf_string;
	do
	{
		v7 = *v6;
		++v6;
		v8 = ~v7 & (v7 - 0x1010101) & 0x80808080;
	}
	while ( !v8 );

	bool v9; // zf@3
	v9 = (unsigned __int16)(v8 & 0x8080) == 0;

	if ( !(v8 & 0x8080) )
		v8 >>= 16;
	if ( v9 )
		v6 = (int *)((char *)v6 + 2);

	encrypt((int)&scanf_string, (char *)v6 +
			-__CFADD__((_BYTE)v8, (_BYTE)v8) - 3 - (char *)&scanf_string);

	return 0;
}
