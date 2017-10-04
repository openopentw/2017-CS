int __cdecl main(int argc, const char **argv, const char **envp)
{
  int v3; // ebx@0
  int v4; // ebp@0
  int v5; // edi@0
  int *v6; // edx@1
  int v7; // ecx@2
  unsigned int v8; // eax@2
  bool v9; // zf@3
  int v11; // [sp-68h] [bp-68h]@0
  int v12; // [sp-64h] [bp-64h]@0
  int v13; // [sp-60h] [bp-60h]@0
  int scanf_string; // [sp-5Ch] [bp-5Ch]@1
  int v15; // [sp-58h] [bp-58h]@1
  int v16; // [sp-54h] [bp-54h]@1
  int v17; // [sp-50h] [bp-50h]@1
  int v18; // [sp-4Ch] [bp-4Ch]@1
  int v19; // [sp-48h] [bp-48h]@1
  int v20; // [sp-44h] [bp-44h]@1
  int v21; // [sp-40h] [bp-40h]@1
  int v22; // [sp-3Ch] [bp-3Ch]@1
  int v23; // [sp-38h] [bp-38h]@1
  int v24; // [sp-34h] [bp-34h]@1
  int v25; // [sp-30h] [bp-30h]@1
  int v26; // [sp-2Ch] [bp-2Ch]@1
  int v27; // [sp-28h] [bp-28h]@1
  int v28; // [sp-24h] [bp-24h]@1
  int *v29; // [sp-14h] [bp-14h]@1
  int v30; // [sp-10h] [bp-10h]@1
  int v31; // [sp-Ch] [bp-Ch]@1
  int v32; // [sp-8h] [bp-8h]@1
  void *v33; // [sp-4h] [bp-4h]@1
  void *retaddr; // [sp+0h] [bp+0h]@1

  v33 = retaddr;
  v32 = v4;
  v31 = v5;
  v30 = v3;
  v29 = &argc;
  memset(&scanf_string, 0, 60u);
  __isoc99_scanf(
    "%60s",
    &scanf_string,
    v11,
    v12,
    v13,
    scanf_string,
    v15,
    v16,
    v17,
    v18,
    v19,
    v20,
    v21,
    v22,
    v23,
    v24,
    v25,
    v26,
    v27,
    v28);
  v6 = &scanf_string;
  do
  {
    v7 = *v6;
    ++v6;
    v8 = ~v7 & (v7 - 0x1010101) & 0x80808080;
  }
  while ( !v8 );
  v9 = (unsigned __int16)(v8 & 0x8080) == 0;
  if ( !(v8 & 0x8080) )
    v8 >>= 16;
  if ( v9 )
    v6 = (int *)((char *)v6 + 2);
  encrypt((int)&scanf_string, (char *)v6 + -__CFADD__((_BYTE)v8, (_BYTE)v8) - 3 - (char *)&scanf_string);
  return 0;
}