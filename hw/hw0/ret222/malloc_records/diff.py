import numpy as np

file_list = [
    './stack_1.txt',
    './stack_2.txt',
    './stack_3.txt',
]

wants = np.zeros((3,1), dtype=int)
stacks = np.zeros((3, 200), dtype=int)
for i,fn in enumerate(file_list):
    with open(fn) as f:
        stack = f.read().split('\n')
        for j,_ in enumerate(stack):
            if j == 0:
                wants[i,0] = int(stack[j], 16)
            else:
                try:
                    stacks[i,j-1] = int(stack[j], 16)
                except:
                    stacks[i,j-1] = 0

diffs = stacks - wants
diff_diffs_1 = diffs[0] - diffs[1]
diff_diffs_2 = diffs[0] - diffs[2]

same_1 = np.where(diff_diffs_1 == 0)
same_2 = np.where(diff_diffs_2 == 0)

print(same_1)
print(same_2)
