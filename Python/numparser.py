import string, re
import numpy as np

from helpers import Helpers as hp
from lc.numeral import Numeral
from lc.ru import Ru

class NumericToken:
    def __init__(self, numeral, error=0):
        self.numeral = numeral
        self.error = error
        self.is_significant = False

    def print(self, indent):
        return '\n' \
               + indent + '{numeral = ' + str(self.numeral.print (indent + '   ')) + ',\n' + ' ' \
               + indent + 'error = '   +  str(self.error) + ',\n' + ' ' \
               + indent + 'is_significant = ' + str(self.is_significant) + '}'

class ParserResult:
    def __init__(self, value, error=0):
        self.value = value
        self.error = error

    def print(self, indent):
        return '{value = ' + str(self.value) + ',\n' + ' ' \
               + indent + 'error = ' +  str(self.error) +  '}'

class Parser:
    def __init__(self):
        self.ru = Ru()
        self.tokens = self.ru.tokens
        self.tokens_fractions = self.ru.tokens_fractions
        self.max_token_error = 0.3

    def get_token_sum_error_from_lists(self, token):
        token_sum_error = 0

        if isinstance(token, NumericToken):
            token_sum_error += token.error

        else:
            for sub_token in token:
                token_sum_error += self.get_token_sum_error_from_lists(sub_token)

        return token_sum_error

    def parse_tokens(self, text_line, level, fraction=False):
        if text_line in self.tokens.keys():
            return [NumericToken(self.tokens[text_line])]
        elif fraction:
            return [NumericToken(self.tokens_fractions[text_line])]
        else:
            return [None]

    def parse(self, text):
        text = text.strip().lower()

        if len(text) == 0:
            return ParserResult(value=0, error=1)

        # Разбиваем текст на токены
        raw_token_list = re.split(r"\s+", text)
        all_token_list = []
        token_list = []
        result_text_list = []
        left_space_for_number = False
        current_level = 0

        # Обрабатываем токены
        for token_idx, raw_token in enumerate(raw_token_list):
            clean_token = raw_token.strip(string.punctuation)
            current_token_list = self.parse_tokens(clean_token, 0)
            #print (hp.show_object(current_token_list))

            # Определение дробного числа:
            if clean_token in ["целых", "целой", "целым", "целая"] and token_idx != 0:

                #print (raw_token_list)

                try:
                    if raw_token_list[token_idx - 1] in self.tokens \
                            and raw_token_list[token_idx + 1] in self.tokens \
                            or raw_token_list[token_idx + 1] == "и":
                        if raw_token_list[token_idx + 2] in self.tokens_fractions \
                                or raw_token_list[token_idx + 3] in self.tokens_fractions \
                                or raw_token_list[token_idx + 4] in self.tokens_fractions:
                            current_token_list = self.parse_tokens(clean_token, 0, fraction=True)

                except IndexError:
                    pass

            # Обработка первого порядка:
            if clean_token in ["десятых", "десятой", "десятым", "десятая"] and token_idx != 0:

                if raw_token_list[token_idx - 1] in self.tokens:
                    current_token_list = self.parse_tokens(clean_token, 0, fraction=True)

            # Обработка второго порядка:
            if clean_token in ["сотых", "сотой", "сотым", "сотая"] and token_idx != 0:

                if raw_token_list[token_idx - 1] in self.tokens:
                    current_token_list = self.parse_tokens(clean_token, 0, fraction=True)

            # Обработка третьего порядка:
            if clean_token in ["тысячных", "тысячной", "тысячным", "тысячная"] and token_idx != 0:

                if raw_token_list[token_idx - 1] in self.tokens:
                    current_token_list = self.parse_tokens(clean_token, 0, fraction=True)

            # Обработка четвёртого порядка:
            if clean_token in ["десятитысячных", "десятитысячной", "десятитысячным", "десятитысячная"] and token_idx != 0:

                if raw_token_list[token_idx - 1] in self.tokens:
                    current_token_list = self.parse_tokens(clean_token, 0, fraction=True)

            if raw_token == "тысяча":
                if token_idx == 0 or raw_token_list[token_idx - 1] != "одна":
                    current_token_list = [NumericToken(numeral=Numeral(1, 1, False)), current_token_list[0]]
                    current_level = 1

                    if len(token_list) > 0:
                        all_token_list.append(token_list)
                        token_list = []

                    left_space_for_number = False

            if raw_token == "тысячная":
                if token_idx == 0 or raw_token_list[token_idx - 1] != "одна":
                    current_token_list = [NumericToken(numeral=Numeral(1000, 1, False))]
                    current_level = 0

                    if len(token_list) > 0:
                        all_token_list.append(token_list)
                        token_list = []

                    left_space_for_number = False

            if raw_token == "десятая":
                if token_idx == 0 or raw_token_list[token_idx - 1] != "одна":
                    current_token_list = [NumericToken(numeral=Numeral(10, 1, False))]
                    current_level = 0

                    if len(token_list) > 0:
                        all_token_list.append(token_list)
                        token_list = []

                    left_space_for_number = False

            if raw_token == "сотая":
                if token_idx == 0 or raw_token_list[token_idx - 1] != "одна":
                    current_token_list = [NumericToken(numeral=Numeral(100, 1, False))]
                    current_level = 0

                    if len(token_list) > 0:
                        all_token_list.append(token_list)
                        token_list = []

                    left_space_for_number = False

            if raw_token == "ноль":
                if token_idx != 0 or raw_token_list[token_idx - 1] == "ноль":
                    current_token_list = [NumericToken(numeral=Numeral(0, 1, False)), current_token_list[0]]
                    current_level = 0

                    if len(token_list) > 0:
                        all_token_list.append(token_list)
                        token_list = []

                    left_space_for_number = False

            if current_token_list[0] is not None:
                #print(hp.show_object(current_token_list))
                previous_level = current_level
                current_level = current_token_list[len(current_token_list) - 1].numeral.level
                is_eleven_to_nineteen = current_token_list[0].numeral.is_eleven_to_nineteen

                #print(current_level)
                #print(previous_level)

                if current_level != 0 and previous_level != 0 and (
                        (previous_level < current_level <= 3) or 
                        (current_level == previous_level)     or 
                        (current_level < previous_level <= 2 and is_eleven_to_nineteen)):

                    all_token_list.append(token_list)
                    token_list = []
                    left_space_for_number = False

            #print(hp.show_object(all_token_list))

            bad_tokens = True

            for current_token in current_token_list:
                if current_token is None:
                    break

                if current_token.error <= self.max_token_error:
                    bad_tokens = False
                    break

            #print(bad_tokens)

            if bad_tokens is True:
                del current_token_list
                current_token_list = [None]

            if current_token_list[0] is not None:
                if left_space_for_number is False:
                    result_text_list.append("")
                    left_space_for_number = True

                for current_token in current_token_list:
                    token_list.append(current_token)
                    #print(hp.show_object(token_list))


            else:
                result_text_list.append(raw_token)
                left_space_for_number = False
                current_level = 0

                if len(token_list) > 0:
                    all_token_list.append(token_list)
                    token_list = []

        if len(token_list) > 0:
            all_token_list.append(token_list)
            token_list = []

        #pprint(vars(all_token_list[0][1].numeral))
        parser_result_list = []

        for token_list in all_token_list:
            global_level = None
            local_level = None
            global_value = None
            local_value = None
            critical_error = False

            token_count = len(token_list)

            for current_token in token_list:
                current_error = self.get_token_sum_error_from_lists(current_token)

                if current_error > self.max_token_error:
                    continue

                value = current_token.numeral.value
                level = current_token.numeral.level
                multiplier = current_token.numeral.is_multiplier

                if multiplier:
                    if global_level is None:
                        if local_level is None:
                            global_value = value
                        else:
                            global_value = np.round(local_value * value, 5)

                        global_level = level
                        local_value = None
                        local_level = None

                        current_token.is_significant = True

                    elif global_level > level:
                        if local_level is None:
                            global_value = global_value + value
                        else:
                            if value >= 0.1:
                                global_value = np.round((global_value + local_value * value), 1)
                            elif value == 0.01:
                                global_value = np.round((global_value + local_value * value), 2)
                            elif value == 0.001:
                                global_value = np.round((global_value + local_value * value), 3)
                            elif value == 0.0001:
                                global_value = np.round((global_value + local_value * value), 4)

                        global_level = level
                        local_value = None
                        local_level = None

                        current_token.is_significant = True

                    else:
                        # Ошибка несоответствия уровней
                        current_token.error = 1
                        current_token.is_significant = True
                        critical_error = True

                else:
                    # Простое числительное
                    if local_level is None:
                        local_value = value
                        local_level = level

                        current_token.is_significant = True

                    elif local_level > level:
                        local_value = local_value + value
                        local_level = level

                        current_token.is_significant = True

                    else:
                        # Ошибка несоответствия уровней
                        current_token.error = 1
                        current_token.is_significant = True
                        critical_error = True

            # Считаем общий уровень ошибки
            if token_count == 0:
                total_error = 1

            else:
                total_error = 0
                significant_token_count = 0

                for current_token in token_list:
                    if current_token.is_significant:
                        total_error += current_token.error
                        significant_token_count += 1

                total_error /= significant_token_count

            if critical_error:
                # Имела место критическая ошибка
                if total_error >= 0.5:
                    total_error = 1

                else:
                    total_error *= 2

            result_value = 0

            if global_value is not None:
                result_value += global_value

            if local_value is not None:
                result_value += local_value

            parser_result_list.append(ParserResult(result_value, total_error))

            #print (hp.show_object(parser_result_list))
            #print (hp.show_object(result_text_list))

        return parser_result_list, result_text_list

    def convert(self, text_line):
        if not text_line:
            return text_line

        parsed_list, result_text_list = self.parse(text=text_line)
        converted_text = ""
        parsed_idx = 0
        result_text_list_len = len(result_text_list)

        for i, element in enumerate(result_text_list):
            if element == "":
                converted_text += str(parsed_list[parsed_idx].value)
                parsed_idx += 1

            else:
                converted_text += element

            if i < result_text_list_len - 1:
                converted_text += " "

        return converted_text

if __name__ == "__main__":
    parser = Parser()

    while True:
        text_line = input("Введите ваш текст:\n")
        converted_line = parser.convert(text_line)
        print(f"\nРаспознанное: {converted_line}\n\n")