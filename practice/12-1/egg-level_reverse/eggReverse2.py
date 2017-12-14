import angr
import claripy

project = angr.Project('./eggReverse2')
argv1 = claripy.BVS('argv1', 100*8)
initial_state = project.factory.entry_state(args=['./eggReverse2', argv1])
sm = project.factory.simulation_manager(initial_state)
sm.explore(find=0x80485f8)
sm.found
found = sm.found[0]
solution = found.solver.eval(argv1, cast_to=str)
print solution
print repr(solution)
