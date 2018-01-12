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

		// filter all not number(0~9) & not '+ - * / %'
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

int *eval(int *pool, char op)
{
	// XXX: no canary in this function

	switch(op) {
		case '+':
			pool[pool[0] - 1] += pool[pool[0]];
			break;
		case '-':
			pool[pool[0] - 1] -= pool[pool[0]];
			break;
		case '*':
			pool[pool[0] - 1] *= pool[pool[0]];
			break;
		case '/':
			pool[pool[0] - 1] /= pool[pool[0]];
			break;
	}
	--pool[0];
	return pool;
}

int parse_expr(char *expr_buf, int *pool)
{
	char ops[0x10];
	bzero(ops, 0x64);
	int i_ops = 0;
	char *last_end_expr = expr_buf;
	for(int i = 0; ; ++i) {
		if( (unsigned int)(expr_buf[i] - '0') > 9) { // skip over 0~9
			int num_len = i + expr_buf - last_end_expr;
			char *num_buf = (char*)malloc(num_len + 1);
			memcpy(num_buf, last_end_expr, num_len);
			num_buf[num_len] = '\0';
			if(strcmp(num_buf, "0") == 0) {
				puts("prevent division by zero");
				fflush(stdout);
				return 0;
			}

			int num = atoi(num_buf);
			if(num > 0) {
				pool[0] += 1;
				pool[pool[0]] = num;
			}

			if(expr_buf[i] != '\0' && (unsigned int)(expr_buf[i + 1] - '0') > 9) { // filter out eg: 1+-2
				puts("expression error!");
				fflush(stdout);
				return 0;
			}

			last_end_expr = &(expr_buf[i + 1]);

			if(ops[i_ops] == '\0') {
				ops[i_ops] = expr_buf[i];
			} else {
				switch(expr_buf[i]) {
					case '+':
					case '-':
						eval(pool, ops[i_ops]);
						ops[i_ops] = expr_buf[i];
						break;
					case '%':
					case '*':
					case '/':
						if(ops[i_ops] != '+' && ops[i_ops] != '-') {
							eval(pool, ops[i_ops]);
							ops[i_ops] = expr_buf[i];
						} else {
							++i_ops;
							ops[i_ops] = expr_buf[i];
						}
						break;
					default:
						eval(pool, ops[i_ops]);
						--i_ops;
						break;
				}
			}

			if(expr_buf[i] == '\0') {
				break;
			}
		}
	}

	while(i_ops >= 0) {
		eval(pool, ops[i_ops]);
		--i_ops;
	}

	return 1;
}

void calc()
{
	int pool[0x18];
	char expr_buf[0x194];
	while(1) {
		bzero(expr_buf, 0x400);
		if(get_expr(expr_buf, 0x400) != 0) {
			init_pool(pool);
			if(parse_expr(expr_buf, pool) != 0) {
				printf("%d\n", pool[pool[0]]); // XXX: pool[0] can be control to leak infos
				fflush(stdout);
			}
		}
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
