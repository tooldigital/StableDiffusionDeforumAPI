set /p host=<host.txt
set /p port=<port.txt
cd "api" && conda activate tool_stable_diffusion_deforum_api && uvicorn main:app --host %host% --reload --port %port%