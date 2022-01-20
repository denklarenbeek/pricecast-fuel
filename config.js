exports.cid = ['205036 (van der Knaap)', 'Achilles Brandstoffen Maatschappij', 'Autobedrijf Tesselaar', 'Avia Stadman', 'GP Groot', 'Hanex Tankstations', 'Kuster Energy', 'Lagendijk Brandstof', 'Leus Almelo', 'Minli Tankstations', 'Ototol', 'Shell Fokko Meijer', 'Shell Station De Wetering NL8010', 'Stam Tankstations', 'Tank- en Wascentrum Zwart']
exports.bullmq = {
    maxAttempts: 10,
    maxAttemptsForEmail: 5,
    connection: {
        host: process.env.REDIS_URL
    }
}