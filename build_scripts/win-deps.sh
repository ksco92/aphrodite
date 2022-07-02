pip install -r requirements.txt -t requirements/python/lib/python3.9/site-packages/ --platform manylinux1_x86_64 --only-binary=:all:
powershell Compress-Archive ./requirements/python requirements.zip -Force
powershell rm -r -Force requirements

