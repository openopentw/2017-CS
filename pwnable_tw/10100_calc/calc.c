#include <signal.h>
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <unistd.h>

void timeout()
{
	puts("No time to waste!");
	exit(0);
}

int get_expr(char *expr_buf, int len_read)
{
	char read_buf[0x1b];

	int i = 0;
	for(; i < len_read; ++i) {
		int ret = read(0, read_buf, 1);
		if(ret == -1 || read_buf[0] == '\n') {
			break;
		}
		if(read_buf[0] == '+'
			|| read_buf[0] == '-'
			|| read_buf[0] == '*'
			|| read_buf[0] == '/'
			|| read_buf[0] == '%'
			|| ('0' <= read_buf[0] && read_buf[0] < '9')) {
				expr_buf[i] = read_buf[0];
			}
	}

	expr_buf[i] = 0;
	return i;
}

void init_pool(int *pool)
{
	for(int i = 0; i <= 0x63; ++i) {
		pool[i + 1] = 0;
	}
	return;
}

int parse_expr(char *expr_buf, int *pool)
{
	// TODO
	return 0;
}

void calc()
{
	int pool[0x18];
	char expr_buf[0x194];
	while(1) {
		bzero(expr_buf, 0x400);
		int ret = get_expr(expr_buf, 0x400);
		if(ret == 0) {
			break;
		}
		init_pool(pool);

		int ret = parse_expr(expr_buf, pool);
		if(ret == 0) {
			continue;
		}
		// TODO
	}
	return;
}

int main()
{
	// bsd_signal(0xe, timeout);
	alarm(0x3c);

	puts("=== Welcome to SECPROG calculator ===");
	fflush(stdout);
	calc();
	puts("Merry Christmas!");
	return 0;
}
