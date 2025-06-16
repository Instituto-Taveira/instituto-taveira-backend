// src/common/filters/domain-exception.filter.ts
import {
    ExceptionFilter,
    Catch,
    ArgumentsHost,
    HttpException,
} from '@nestjs/common';

@Catch()
export class DomainExceptionFilter implements ExceptionFilter {
    catch(exception: unknown, host: ArgumentsHost) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse();

        if (exception instanceof HttpException) {
            const status = exception.getStatus();
            const message = exception.getResponse();
            return response.status(status).json({
                statusCode: status,
                message,
            });
        }

        // fallback pra tratar mais erros no futuros...
        return response.status(400).json({
            statusCode: 400,
            message:
                exception instanceof Error
                    ? exception.message
                    : 'Erro interno do servidor',
        });
    }
}
