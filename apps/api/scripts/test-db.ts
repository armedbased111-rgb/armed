import "dotenv/config"
import {prisma} from "../src/prismaClient";

async function main() {
    //Fonction Ping pour s'assurer que la db est monté
const now = await prisma.$queryRaw<{ now: Date }>`SELECT NOW() as now`;
console.log("DB NOW", now[0]?.now.toISOString());
}
main()
.catch((e) => {
    console.error("DB test failed:", e);
    process.exit(1);
})
.finally(async () => {
    await prisma.$disconnect();
});