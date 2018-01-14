#include <stdio.h>
#include <stdlib.h>

int main()
{
	long long int a = 192153584101141162;
	printf("%lld\t", (a*2+2));
	printf("%lld\n", (a*2+2)*48);
	printf("%lld\t", (a*4+3));
	printf("%lld\n", (a*4+3)*48);
	printf("%lld\t", (a*6+4));
	printf("%lld\n", (a*6+4)*48);
	printf("%lld\t", (a*8+6));
	printf("%lld\n", (a*8+6)*48);
	printf("%lld\t", (a*10+7));
	printf("%lld\n", (a*10+7)*48);
	printf("%lld\t", (a*12+8));
	printf("%lld\n", (a*12+8)*48);
	return 0;
}
