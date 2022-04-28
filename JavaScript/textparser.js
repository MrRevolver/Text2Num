eval (GetFileContent('numparser.js'));

function Converter () {

    var Parent     = new Parser ();
    Parent.numbers = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];

    Parent.convert = function (text_line) 
    {
        if (!text_line) return text_line;

        var result               = this.parse(text_line);
        var parsed_list          = result[0];
        var result_text_list     = result[1];
        var converted_text       = '';
        var parsed_idx           = 0;
        var result_text_list_len = result_text_list.length;

        for (var idx in result_text_list) {

            var element = result_text_list[idx];

            if (element == '') {
                converted_text += parsed_list[parsed_idx].value;
                parsed_idx += 1
            }
            else converted_text += element;

            if (idx < result_text_list_len - 1) converted_text += ' ';
        }

        converted_text = this.postprocessing (converted_text)
        return converted_text
    }

    Parent.postprocessing = function (converted_text) 
    {
        var converted_arr = converted_text.split ('');
        //WScript.Echo (ShowObject (converted_arr));

        if (converted_text.indexOf ('минус') != -1 && converted_text.indexOf (' и ') == -1) {

            for (var x in this.numbers) {
                if (x in converted_arr) converted_text = converted_text.replace("минус ", "-")
            }
        }    

        if (converted_text.indexOf ('точка') != -1) {
            // Если встретили слово "точка"
            for (var idx in converted_arr) {

                idx = +idx;
                var val = converted_text[idx];

                if (val == "т") {

                    if (converted_arr[idx + 4] == "а" &&                                                 
                        converted_arr[idx - 2] in this.numbers &&
                        converted_arr[idx + 6] in this.numbers &&
                        converted_arr[idx + 6] == '0' &&
                        converted_arr[idx + 7] == '.') {
                        
                        converted_text = converted_text.replace(' точка ', '.').replace('0.', '')
                    }

                    if (converted_arr[idx + 4] == 'а' &&
                        converted_arr[idx - 2] in this.numbers &&
                        converted_arr[idx + 6] in this.numbers) {
                        
                        converted_text = converted_text.replace(' точка ', '.')
                    }
                }
            }
        }

        if (converted_text.indexOf ('запятая') != -1) {
            // Если встретили слово "запятая"
            for (var idx in converted_arr) {

                idx = +idx;
                var val = converted_arr[idx];
                
                if (val == 'з') {
                    
                    if (converted_arr[idx + 6] == 'я' &&
                        converted_arr[idx - 2] in this.numbers &&
                        converted_arr[idx + 8] in this.numbers &&
                        converted_arr[idx + 8] == '0' &&
                        converted_arr[idx + 9] == '.' ) {
                        
                        converted_text = converted_text.replace(' запятая ', '.').replace('0.', '')
                    }
                    
                    if (converted_arr[idx + 6] == 'я' &&
                        converted_arr[idx - 2] in this.numbers &&
                        converted_arr[idx + 8] in this.numbers) {

                        converted_text = converted_text.replace(" запятая ", ".")
                    }
                }
            }

        }

        if (converted_text.indexOf (' и ')) {

            for (var idx in converted_arr) { 
                idx = +idx;
                var val = converted_arr[idx];

                if (val == "и" &&
                    converted_arr[idx + 2] in this.numbers &&
                    converted_arr[idx - 1] == " " &&
                    converted_arr[idx - 2] in this.numbers) {

                    if (converted_text.indexOf (' 0.')) {
                        converted_text = converted_text.replace("0.", ".").replace(" и ", "")
                        if (converted_text.indexOf ('после запятой')) converted_text = converted_text.replace(" после запятой", "")
                    }

                    if (converted_text.indexOf ('после запятой')) {
                        converted_text = converted_text.replace(" и ", ".").replace(" после запятой", "")
                    }
                    else {
                        converted_text = converted_text.replace(" и ", ".")
                    }
                }
            }
        }

        return converted_text
    }

    Parent.constructor = arguments.callee;
    return Parent;
}

var converter = new Converter ();
WScript.Echo (converter.convert ('минус три миллиона триста семь целых пять сотых'));