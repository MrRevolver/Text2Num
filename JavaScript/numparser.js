eval (GetFileContent ('lc/ru.js'));
eval (GetFileContent ('helpers.js'));

function NumeralProp (value, level, is_multiplier, is_eleven_to_nineteen) 
{    
    this.value = value;
    this.level = level;
    this.is_multiplier = is_multiplier;
    this.is_eleven_to_nineteen = (is_eleven_to_nineteen === undefined)? false : is_eleven_to_nineteen;
}    

function NumericToken (numeral, error) 
{
    this.numeral = numeral;
    this.error   = (error === undefined)? 0 : error;
    this.is_significant = false;
}

function ParserResult (value, error) 
{
    this.value = value;
    this.error = (error === undefined)? 0 : error;
}

function Parser () {

    var Parent = new Ru ();

    function CleanPunctuation (In)
    {
       var Punctuation = '!"#$%&\'()*+, -./:;<=>?@[\]^_`{|}~';
       var StartPos    = 0;
       var EndPos      = In.length;

       for (;StartPos < EndPos; StartPos++) {
           if (Punctuation.indexOf (In.charAt (StartPos)) === -1) break;
       }

       for (;EndPos != 0; EndPos--) {
          if (Punctuation.indexOf (In.charAt (EndPos)) === -1) break;
       }

       return In.substring (StartPos, EndPos + 1);
    }

    function GetKeys (Arr) 
    {
        var KeysTokens = [];
        for (var Key in Arr) KeysTokens.push (Key);
        return KeysTokens;
    }

    function inArray (Arr, Prop)
    {
        var Count = -1;
        for (var i in Arr) {
            Count++;
            if (Arr[i] == Prop) return Count;
        }
        return -1;
    }

    Parent.get_token_sum_error_from_lists = function (token) 
    {
        var token_sum_error = 0;

        if (token instanceof NumericToken) token_sum_error += token.error
        else {
            for (var token_idx in token) {
                var sub_token = token[token_idx];
                token_sum_error += this.get_token_sum_error_from_lists (sub_token)
            }
        }

        return token_sum_error;
    }

    Parent.parse_tokens = function (text_line, fraction) 
    {
        this.fraction   = (fraction === undefined)? false : fraction;
        var keys_tokens = GetKeys (this.tokens);

        if (inArray (keys_tokens, text_line) != -1) {
            return [new NumericToken (this.tokens[text_line])];
        }
        else if (fraction) return [new NumericToken (this.tokens_fractions[text_line])];
        else return [null];
    }

    Parent.parse  = function (text) 
    {
        var text = Trim (text).toLowerCase ();

        if (text.length == 0) return ParserResult (0, 1);

        // Разбиваем текст на токены
        var raw_token_list        = text.split (/\s+/);
        var all_token_list        = [];
        var token_list            = [];
        var result_text_list      = [];
        var left_space_for_number = false;
        var current_level         = 0;

        // Обрабатываем токены
        for (var token_idx in raw_token_list) {

            token_idx     = +token_idx;
            var raw_token = raw_token_list[token_idx]

            var clean_token        = CleanPunctuation  (raw_token);
            var current_token_list = this.parse_tokens (clean_token, false)

            //WScript.Echo (ShowObject (current_token_list));
            
            // Получаем массив числительных языка
            var keys_tokens    = GetKeys (this.tokens);
            var keys_fractions = GetKeys (this.tokens_fractions);
            
            // Определение дробного числа:
            if (inArray (['целых', 'целой', 'целым', 'целая'], clean_token) != -1 && token_idx != 0) {
                
                if ((inArray (keys_tokens, raw_token_list[token_idx - 1]) != -1  &&
                     inArray (keys_tokens, raw_token_list[token_idx + 1]) != -1) ||
                     raw_token_list[token_idx + 1] == "и") {
                        
                    if (inArray (keys_fractions, raw_token_list[token_idx + 2]) != -1 ||
                        inArray (keys_fractions, raw_token_list[token_idx + 3]) != -1 ||
                        inArray (keys_fractions, raw_token_list[token_idx + 4]) != -1) {

                        current_token_list = this.parse_tokens (clean_token, true);
                    }
                }
            }

            // Обработка первого порядка:
            if (inArray (["десятых", "десятой", "десятым", "десятая"], clean_token) != -1 && token_idx != 0) {

                if (inArray (keys_tokens, raw_token_list[token_idx - 1]) != -1) {
                    current_token_list = this.parse_tokens (clean_token, true)
                }
            }

            // Обработка второго порядка:
            if (inArray (["сотых", "сотой", "сотым", "сотая"], clean_token) != -1 && token_idx != 0) {

                if (inArray (keys_tokens, raw_token_list[token_idx - 1]) != -1) {
                    current_token_list = this.parse_tokens (clean_token, true)
                }
            }

            // Обработка третьего порядка:
            if (inArray (["тысячных", "тысячной", "тысячным", "тысячная"], clean_token) != -1 && token_idx != 0) {

                if (inArray (keys_tokens, raw_token_list[token_idx - 1]) != -1) {
                    current_token_list = this.parse_tokens (clean_token, true)
                }
            }

            // Обработка четвёртого порядка:
            if (inArray (["десятитысячных", "десятитысячной", "десятитысячным", "десятитысячная"], clean_token) != -1 && token_idx != 0) {

                if (inArray (keys_tokens, raw_token_list[token_idx - 1]) != -1) {
                    current_token_list = this.parse_tokens (clean_token, true)
                }
            }

            // Простые числительные - исключения
            if (raw_token == "тысяча") {

                if (token_idx == 0 || raw_token_list[token_idx - 1] != "одна") {

                    current_token_list = [new NumericToken (Numeral (1, 1, false)), current_token_list[0]];
                    current_level      = 1;

                    if (token_list.length > 0) {
                        all_token_list.push (token_list);
                        token_list = [];
                    }

                    left_space_for_number = false;
                }
            }

            if (raw_token == "тысячная") {

                if (token_idx == 0 || raw_token_list[token_idx - 1] != "одна") {

                    current_token_list = [new NumericToken (Numeral (1000, 1, false))];
                    current_level      = 0;

                    if (token_list.length > 0) {
                        all_token_list.push (token_list);
                        token_list = [];
                    }

                    left_space_for_number = false;
                }
            }

            if (raw_token == "сотая") {

                if (token_idx == 0 || raw_token_list[token_idx - 1] != "одна") {

                    current_token_list = [new NumericToken,(Numeral (100, 1, false))];
                    current_level      = 0;

                    if (token_list.length > 0) {
                        all_token_list.push (token_list);
                        token_list = [];
                    }

                    left_space_for_number = false;
                }
            }

            if (raw_token == "десятая") {

                if (token_idx == 0 || raw_token_list[token_idx - 1] != "одна") {

                    current_token_list = [new NumericToken (Numeral (10, 1, false))];
                    current_level      = 0;

                    if (token_list.length > 0) {
                        all_token_list.push (token_list);
                        token_list = [];
                    }

                    left_space_for_number = false;
                }
            }

            if (raw_token == "ноль") {

                if (token_idx != 0 || raw_token_list[token_idx - 1] == "ноль") {

                    current_token_list = [new NumericToken (Numeral (0, 1, false)), current_token_list[0]];
                    current_level      = 0;

                    if (token_list.length > 0) {
                        all_token_list.push (token_list);
                        token_list = [];
                    }

                    left_space_for_number = false;
                }
            }
            
            //WScript.Echo (ShowObject (current_token_list));

            // Обработка целой части числа
            if (current_token_list[0] != null) {

                var list_size  = 0;
                previous_level = current_level;

                for (var current_token_list_idx in current_token_list) {
                    if (current_token_list.hasOwnProperty (current_token_list_idx)) list_size++;
                }

                current_level         = current_token_list[list_size - 1].numeral.level;
                is_eleven_to_nineteen = current_token_list[0].numeral.is_eleven_to_nineteen

                if (current_level != 0 && previous_level != 0 && (
                        (previous_level < current_level && current_level <= 3) || 
                        (current_level == previous_level)                      || 
                        (current_level < previous_level && previous_level <= 2 && is_eleven_to_nineteen))) {
                    
                    all_token_list.push (token_list);
                    token_list = [];
                    left_space_for_number = false;
                    
                }
            }

            //WScript.Echo (ShowObject (all_token_list));

            var bad_tokens = true;

            for (var current_idx in current_token_list) {
                var current_token = current_token_list[current_idx];

                if (current_token == null) break;

                if (current_token.error <= this.max_token_error) {
                    bad_tokens = false;
                    break;
                }
            }

            if (bad_tokens) current_token_list = [];

            if (current_token_list[0] != null) {

                if (!left_space_for_number) {
                    result_text_list.push ('');
                    left_space_for_number = true;
                }

                for (var current_idx in current_token_list) {
                    var current_token = current_token_list[current_idx];
                    token_list.push (current_token);
                }
            }
            else {
                result_text_list.push (raw_token);
                left_space_for_number = false;
                current_level = 0;

                if (token_list.length > 0) {
                    all_token_list.push (token_list);
                    token_list = [];
                }
            }
        }

        if (token_list.length > 0) {
            all_token_list.push (token_list);
            token_list = [];
        }

        var parser_result_list = [];

        // Собираем токены в число
        for (var all_token_list_idx in all_token_list) {

            var global_level   = null;
            var local_level    = null;
            var global_value   = null;
            var local_value    = null;
            var critical_error = false;

            var token_list  = all_token_list[all_token_list_idx];
            var token_count = token_list.length;

            //WScript.Echo (ShowObject (token_list));

            for (var current_idx in token_list) {

                var current_token = token_list[current_idx];
                var current_error = this.get_token_sum_error_from_lists (current_token);

                if (current_error > this.max_token_error) {
                    continue
                }

                //WScript.Echo (ShowObject (current_token));

                var value      = current_token.numeral.value;
                var level      = current_token.numeral.level;
                var multiplier = current_token.numeral.is_multiplier;

                if (multiplier) {

                    if (global_level == null) {
                        //WScript.Echo ('Множитель - первый');

                        if (local_level == null) global_value = global_value + value;
                        else global_value = Math.round (local_value * value * 100000) / 100000;

                        global_level = level;
                        local_value  = null;
                        local_level  = null;

                        current_token.is_significant = true;
                    }
                    else if (global_level > level) {
                        //WScript.Echo ('Множитель - приставной');

                        if (local_level == null) global_value = global_value + value;
                        else{
                            if      (value >= 0.01)   global_value = Math.round ((global_value + local_value * value) * 100) / 100;
                            else if (value == 0.001)  global_value = Math.round ((global_value + local_value * value) * 1000) / 1000;
                            else if (value == 0.0001) global_value = Math.round ((global_value + local_value * value) * 10000) / 10000;
                        }

                        global_level = level;
                        local_value  = null;
                        local_level  = null;

                        current_token.is_significant = true;
                    }
                    else {
                        //WScript.Echo ('Множитель - ошибка');

                        current_token.error = 1;
                        critical_error      = true;

                        current_token.is_significant = true;
                    }
                }
                else {

                    if (local_level == null) {
                        //WScript.Echo ('Цифра - первая');

                        local_value = value;
                        local_level = level;

                        current_token.is_significant = true;
                    }
                    else if (local_level > level) {
                        //WScript.Echo ('Цифра - приставная');

                        local_value = local_value + value;
                        local_level = level;
                        
                        current_token.is_significant = true;
                    }
                    else {
                        //WScript.Echo ('Цифра - Ошибка');

                        current_token.error = 1;
                        critical_error      = true;

                        current_token.is_significant = true;
                    }
                }
            }

            // Считаем общий уровень ошибки
            if (token_count == 0) total_error = 1;
            else {
                total_error             = 0;
                significant_token_count = 0;

                for (var idx in token_list) {

                    current_token = token_list[idx];

                    if (current_token.is_significant) {
                        total_error += current_token.error;
                        significant_token_count += 1;
                    }
                }

                total_error /= significant_token_count;
            }

            // Критическая ошибка
            if (critical_error) {
                if (total_error >= 0.5) total_error  = 1;
                else                    total_error *= 2;
            }

            result_value = 0;

            if (global_value != null) result_value += global_value;
            if (local_value  != null) result_value += local_value;

            parser_result_list.push (new ParserResult (result_value, total_error));
        }

        //WScript.Echo (ShowObject (parser_result_list));
        //WScript.Echo (ShowObject (result_text_list));

        return [parser_result_list, result_text_list];
    }

    Parent.constructor = arguments.callee;
    return Parent;
}