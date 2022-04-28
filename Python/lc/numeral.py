class Numeral:
    def __init__(self, value, level, is_multiplier, is_eleven_to_nineteen=False):
        self.value = value
        self.level = level
        self.is_multiplier = is_multiplier
        self.is_eleven_to_nineteen = is_eleven_to_nineteen

    def print(self, indent):
        return '{value = ' + str(self.value) + ',\n' \
                  + indent + indent + '   ' + 'level = ' +  str(self.level) + ',\n' \
                  + indent + indent + '   ' + 'is_multiplier = ' + str(self.is_multiplier) + ',\n' \
                  + indent + indent + '   ' + 'is_eleven_to_nineteen = ' + str(self.is_eleven_to_nineteen) + '}' 