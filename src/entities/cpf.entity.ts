export class CPF {
    private readonly value: string;

    constructor(cpf: string) {
        this.value = CPF.format(cpf);
    }

    public getValue() {
        return this.value;
    }

    static isValid(cpf: string): boolean {
        if (!cpf || cpf.length !== 11 || /^(\d)\1{10}$/.test(cpf)) return false;

        const calc = (len: number) => {
            const sum = cpf
                .split('')
                .slice(0, len)
                .reduce((acc, digit, i) => acc + parseInt(digit) * (len + 1 - i), 0);
            const rest = (sum * 10) % 11;
            return rest === 10 ? 0 : rest;
        };

        const digit1 = calc(9);
        const digit2 = calc(10);

        return digit1 === parseInt(cpf[9]) && digit2 === parseInt(cpf[10]);
    }

    static format(cpf: string): string {
        return cpf
    }
}
