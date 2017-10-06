#include <stdio.h>

int __fastcall WriteSomething(__int64 a1)
{
  printf("data :");
  read_input(a1, 8LL);
  return puts("done !");
}

signed __int64 __fastcall read_input(void *a1, unsigned int a2)
{
  signed __int64 result; // rax@4
  int v3; // [sp+1Ch] [bp-4h]@1

  v3 = read(0, a1, a2);
  if ( v3 <= 0 )
  {
    puts("read error");
    _exit(1);
  }
  result = *((_BYTE *)a1 + v3 - 1);
  if ( (_BYTE)result == 10 )
  {
    result = (signed __int64)((char *)a1 + v3 - 1);
    *(_BYTE *)result = 0;
  }
  return result;
}

signed __int64 __fastcall check(const char *a1)
{
  int i; // [sp+1Ch] [bp-14h]@1

  for ( i = 0; i < strlen(a1); ++i )
  {
    if ( !isalnum(a1[i]) )
      return 0LL;
  }
  return 1LL;
}

int __cdecl main(int argc, const char **argv, const char **envp)
{
  __int64 v3; // rax@2
  int result; // eax@3
  __int64 v5; // rcx@3
  char nptr; // [sp+0h] [bp-30h]@2
  __int64 v7; // [sp+28h] [bp-8h]@1

  v7 = *MK_FP(__FS__, 40LL);
  setvbuf(stdin, 0LL, 2, 0LL);
  setvbuf(stdout, 0LL, 2, 0LL);
  printf("What's your name :", 0LL);
  read_input(6295712LL, 48LL);
  if ( check(6295712LL) )
  {
    printf("Where do you want to write :");
    read_input(&nptr, 24LL);
    v3 = strtoll(&nptr, 0LL, 16);
    WriteSomething(v3, 0LL);
  }
  result = 0;
  v5 = *MK_FP(__FS__, 40LL) ^ v7;
  return result;
}
