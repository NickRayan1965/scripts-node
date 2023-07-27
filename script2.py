import asyncio
import json
import time

def get_current_time_milliseconds():
    current_time = int(time.time() * 1000)
    return current_time
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

        result['misma_longitud'] = {
            'respuesta': 'Si corresponden las logitudes en todos los datos',
            'detalles': []
        }
        same_length = True
        for index, (line1, line2) in enumerate(zip(lines_file1, lines_file2)):
            columns1 = line1.split()
            columns2 = line2.split()

            if len(columns1) != len(columns2):
                result['misma_longitud']['detalles'].append(f"La linea {index + 1} no tiene la misma cantidad de columnas")
                same_length = False
            else:
                for col_index, (col1, col2) in enumerate(zip(columns1, columns2)):
                    if len(col1) != len(col2):
                        result['misma_longitud']['detalles'].append(f"La columna {col_index + 1} de la linea {index + 1} no tiene la misma longitud")
                        same_length = False

        if not same_length:
            result['misma_longitud']['respuesta'] = 'No corresponden las longitudes en todos los datos'

        result['mismo_texto'] = f"Respuesta: {'si' if file1_content == file2_content else 'no'} son los mismos textos."
        formatted_result = json.dumps(result, indent = 2)
        print(formatted_result)
        #random name
        output_file_path = './result' + str(get_current_time_milliseconds()) + '.txt'
        detalles = ''
        for detalle in result['misma_longitud']['detalles']:
            detalles += '\t' + detalle + '\n'
        text = 'MISMO TEXTO => ' + result['mismo_texto'] + '\n\n' + 'MISMO NÚMERO DE COLUMNAS => ' +  result['mismo_n_columnas'] + '\n\n' + 'MISMA LONGITUD => ' + result['misma_longitud']['respuesta'] + '\n' + 'DETALLES: \n' + detalles + '\n'
        with open(output_file_path, 'w', encoding='utf-8') as output_file:
            output_file.write(text)
    except Exception as err:
        print(f'Error al leer los archivos: {err}')
asyncio.run(main())
