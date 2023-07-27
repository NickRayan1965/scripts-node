import asyncio

async def read_file_async(file_path):
    with open(file_path, 'r') as file:
        return file.read()

async def main():
    file1_path = './archivos/demo1.txt'
    file2_path = './archivos/demo2.txt'

    try:
        file1_content = await read_file_async(file1_path)
        file2_content = await read_file_async(file2_path)

        lines_file1 = file1_content.strip().split('\n')
        lines_file2 = file2_content.strip().split('\n')
        
        result = {}

        num_columns_file1 = [len(line.split()) for line in lines_file1]
        num_columns_file2 = [len(line.split()) for line in lines_file2]
        result['mismo_n_columnas'] = f"Respuesta: {'si' if num_columns_file1 == num_columns_file2 else 'no'} corresponden al mismo numero de columnas por linea"

        result['misma_longitud'] = 'Respuesta: '
        same_length = all(
            len(columns1) == len(columns2) and all(len(col1) == len(col2) for col1, col2 in zip(columns1, columns2))
            for columns1, columns2 in zip((line.split() for line in lines_file1), (line.split() for line in lines_file2))
        )
        result['misma_longitud'] += f"{'si' if same_length else 'no'} corresponden los datos por longitud"

        result['mismo_texto'] = f"Respuesta: {'si' if file1_content == file2_content else 'no'} son los mismos textos."

        print(result)
    except Exception as err:
        print(f'Error al leer los archivos: {err}')

asyncio.run(main())
