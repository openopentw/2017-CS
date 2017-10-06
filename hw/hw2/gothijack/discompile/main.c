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