import {
  ValidationArguments,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';

@ValidatorConstraint({ name: 'ipValidator', async: false })
export class IpValidator implements ValidatorConstraintInterface {
  validate(ip: string, validationArguments?: ValidationArguments): boolean {
    const type = validationArguments.object['type'];

    if (type === 'A')
      return ip.match(/^((((25[0-5]|(2[0-4]|1\d|[1-9]|)\d)\.?\b){4})|dynamic)$/) !== null;
    if (type === 'AAAA') return ip.match(/^([0-9A-F:]*|dynamic)$/) !== null;

    return true;
  }
  defaultMessage?(validationArguments?: ValidationArguments): string {
    const type = validationArguments.object['type'];
    if (type === 'A') return 'ip must be a valid ipv4 address or dynamic';
    if (type === 'AAAA') return 'ip must be a valid ipv6 address or dynamic';
  }
}
