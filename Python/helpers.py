class Helpers:
    def show_object(self, val, level=0):
        if level > 5:
            return '[...]'

        out = ''
        indent = ''

        for i in range (0, level):
            Indent += '   '

        if type (val) is dict or type (val) is list:

            out += '[' if type (val) is list else '{'

            if type (val) is list:
                i = 0
                for value in val:
                    substr = self.show_object (value, Level + 1)
                    out += indent + str (i) + ':' + str (substr) + ',\n'
                    i = i + 1

            if type (val) is dict:
                for idx, value in val:
                    substr = self.show_object (value, Level + 1)
                    Out += indent  + str (idx) + ': ' + str (substr) + ',\n'

            out += ']' if type (val) is list else '}'

        elif type (val) == str:
            out += '"' + str (val) + '"'

        else:
            #print (type (Val))
            out += str (val.print(indent))

        if out[-3:] == ',\n]':
            out = out[:-3] + ']\n'

        return out