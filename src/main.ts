import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { setDefaultLanguage } from './common/middleware/setDefualtLanguage';
import { LoggingInterceptor } from './common/interceptors/watchReauest.interceptor';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import * as express from 'express';

async function bootstrap() {
  const port=process.env.PORT ?? 5000
  const app = await NestFactory.create(AppModule);
  app.enableCors({
    origin: ["https://davincismagictouch.be", "http://localhost:3000","https://dashboard.davincismagictouch.be/"],
    credentials: true,
  })
  app.use("/order/webhook",express.raw({type:'application/json'}))
  app.use(setDefaultLanguage)
  app.useGlobalInterceptors(new LoggingInterceptor)
  app.useGlobalFilters(new HttpExceptionFilter())
  await app.listen(port,()=>{
    console.log(`Application is running on: ${port}`);
  });
}
bootstrap();
