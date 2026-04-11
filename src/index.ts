import { Elysia, t } from "elysia";
import { swagger } from "@elysiajs/swagger";
import { schedule } from "./routes/schedule";

const app = new Elysia()
  .use(swagger({
    path: "/docs",
    documentation: {
      info: {
        title: "IIUM Schedule API",
        version: "1.0.0",
        description: "API to fetch IIUM course schedules based on various parameters.",
      },
      tags: [
        {name: "Schedule", description: "Course Schedule Endpoints"}
      ]
    }
  }))
  .group("/api", (app) => {
    return app.use(schedule); 
  })
  .listen(process.env.PORT ?? 3000);  

console.log(`🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`);