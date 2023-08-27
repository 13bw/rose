var config = {
    // Velocidade do jogo (padrão: 3)
    GAME_SPEED: 3,

    // Tamanho da matriz que representa o mundo do jogo
    MATRIX_SIZE: 50,

    // Limite máximo de população total
    POPULATION_LIMIT: 1000,

    // Geração das entidades no mundo do jogo
    SHEEP_NUMBER_GENERATION: 100, // Número de ovelhas geradas inicialmente
    WOLF_NUMBER_GENERATION: 10, // Número de lobos gerados inicialmente
    WATER_NUMBER_GENERATION: 15, // Número de corpos d'água gerados inicialmente
    GRASS_NUMBER_GENERATION: 15, // Número de áreas de grama geradas inicialmente

    // Níveis máximos de fome e sede para as entidades
    MAX_HUNGRY: 300,
    MAX_THIRST: 300,

    // Ovelhas
    SHEEP_LIFE: 100, // Vida inicial das ovelhas
    SHEEP_SPEED: 1, // Velocidade de movimento das ovelhas
    SHEEP_VISION_RANGE: 5, // Alcance de visão das ovelhas
    SHEEP_HUNGRY_TO_MOVE: 150, // Nível de fome necessário para as ovelhas se moverem
    SHEEP_THIRST_TO_MOVE: 150, // Nível de sede necessário para as ovelhas se moverem
    SHEEP_HORNY_TO_MOVE: 100, // Nível de desejo reprodutivo necessário para as ovelhas se moverem
    SHEEP_GESTATION_TIME: 333, // Tempo que demora para nascer uma nova ovelha
    SHEEP_BIRTH_PROBABILITY: 6, // Número de possiveis filhotes por gestação

    // Lobos
    WOLF_LIFE: 100, // Vida inicial dos lobos
    WOLF_DAMAGE: 100, // Dano que o lobo causara a ovelha
    WOLF_SPEED: 1, // Velocidade de movimento dos lobos
    WOLF_VISION_RANGE: 5, // Alcance de visão dos lobos
    WOLF_HUNGRY_TO_MOVE: 150, // Nível de fome necessário para os lobos se moverem
    WOLF_THIRST_TO_MOVE: 150, // Nível de sede necessário para os lobos se moverem
    WOLF_HORNY_TO_MOVE: 100, // Nível de desejo reprodutivo necessário para os lobos se moverem
    WOLF_GESTATION_TIME: 999, // Tempo que demora para nascer um novo lobo
    WOLF_BIRTH_PROBABILITY: 3, // Número de possiveis filhotes por gestação
};

var configInfo = {
    GAME_SPEED:
        "Game speed, the smaller the number, the faster the speed (default: 3)",
    MATRIX_SIZE: "Size of the matrix representing the game world",
    POPULATION_LIMIT: "Maximum total population limit",
    SHEEP_NUMBER_GENERATION: "Number of sheep generated initially",
    WOLF_NUMBER_GENERATION: "Number of wolves generated initially",
    WATER_NUMBER_GENERATION: "Number of water bodies generated initially",
    GRASS_NUMBER_GENERATION: "Number of grass areas generated initially",
    MAX_HUNGRY: "Maximum hunger levels for entities",
    MAX_THIRST: "Maximum thirst levels for entities",

    SHEEP_LIFE: "Initial life of sheep",
    SHEEP_SPEED:
        "Movement speed of sheep, the smaller the number, the faster the speed",
    SHEEP_VISION_RANGE: "Vision range of sheep",
    SHEEP_HUNGRY_TO_MOVE: "Level of hunger required for sheep to move",
    SHEEP_THIRST_TO_MOVE: "Level of thirst required for sheep to move",
    SHEEP_HORNY_TO_MOVE:
        "Level of reproductive desire required for sheep to move",
    SHEEP_GESTATION_TIME: "Time it takes for a new sheep to be born",
    SHEEP_BIRTH_PROBABILITY: "Number of possible offspring per gestation",

    WOLF_LIFE: "Initial life of wolves",
    WOLF_DAMAGE: "Damage that the wolf will cause to the sheep",
    WOLF_SPEED:
        "Movement speed of wolves, the smaller the number, the faster the speed",
    WOLF_VISION_RANGE: "Vision range of wolves",
    WOLF_HUNGRY_TO_MOVE: "Level of hunger required for wolves to move",
    WOLF_THIRST_TO_MOVE: "Level of thirst required for wolves to move",
    WOLF_HORNY_TO_MOVE:
        "Level of reproductive desire required for wolves to move",
    WOLF_GESTATION_TIME: "Time it takes for a new wolf to be born",
    WOLF_BIRTH_PROBABILITY: "Number of possible offspring per gestation",
};

const seedSpan = document.getElementById("seed");
const canvas = document.getElementById("canvas");

const effectiveSize = config.MATRIX_SIZE / 0.02;
const paddingFactor = 0.8;
var CanvasMatrix = {
    ctx: canvas.getContext("2d"),
    panX: 0,
    panY: 0,
    isDragging: false,
    zoomLevel: Math.min(
        canvas.width / (effectiveSize * paddingFactor),
        canvas.height / (effectiveSize * paddingFactor)
    ),
    
    zoomCenterX: 0,
    zoomCenterY: 0,

    
    lastMouseX: 0,
    lastMouseY: 0,
};
var simulationCompleted = false;
var lastEntityId = 0;
var lastAnimalId = 0;
var followedAnimalId = null;
var entityId = null;

var matrix;

var Database = {
    Entities: matrix,
    Animals: {},
    Deaths: {},
    AnimalsCount: 0,
    DeathsCount: 0,
    SheepsCount: 0,
    WolvesCount: 0,
    Ticks: 0,
};

function generateSeed() {
    return Date.now();
}

function incrementAnimalCount(animal) {
    if (animal instanceof Sheep) {
        Database.SheepsCount++;
    } else {
        Database.WolvesCount++;
    }
    Database.AnimalsCount++;
    lastAnimalId++;
    animal.id = lastAnimalId;
}

function decrementAnimalCount(animal) {
    if (animal instanceof Sheep) {
        Database.SheepsCount--;
    } else {
        Database.WolvesCount--;
    }
    Database.AnimalsCount--;
    Database.DeathsCount++;
}


class Entity {
    constructor() {
        this.x = 0;
        this.y = 0;
        this.color = "#fff";
        this.borderColor = "#fff";
        this.textColor = "#000";
        this.lastPosition = [this.y, this.x];
        this.ticks = 0;
        this.path = [];
        this.id = lastEntityId;
        lastEntityId++;
    }

    newPosition(x, y) {
        this.x = x;
        this.y = y;
        this.path.push({ x, y });
        this.path = this.path.slice(-20);
    }
}

class Animal extends Entity {
    static POPULATION_LIMIT = config.POPULATION_LIMIT;

    constructor(type = "") {
        super();
        this.thirst = 0;
        this.hungry = 0;
        this.generation = 1;
        this.type = type;
        this.horny = 0;
        this.steps = 0;
        this.mother = null;
        this.father = null;
        this.path = [];
        this.children = {};
        this.cod = false;

        if (pseudoRandom(10) < 5) {
            this.gender = "Male";
        } else {
            this.gender = "Female";
        }

        if (this.gender === "Female") {
            this.pregnant = false;
            this.babies = [];
        }
        this.id = lastAnimalId;
    }
    incrementSteps() {
        this.steps += 1;
    }

    calculateDistance(x1, y1, x2, y2) {
        return (x2 - x1) ** 2 + (y2 - y1) ** 2;
    }

    checkSurroundings(distance) {
        const entities_found = [];

        for (let dx = -distance; dx <= distance; dx++) {
            for (let dy = -distance; dy <= distance; dy++) {
                if (dx === 0 && dy === 0) {
                    continue;
                }
                const x = this.x + dx;
                const y = this.y + dy;

                if (
                    x >= 0 &&
                    x < config.MATRIX_SIZE &&
                    y >= 0 &&
                    y < config.MATRIX_SIZE
                ) {
                    const adjacent_entity = Database.Entities[[y][x]];
                    if (
                        adjacent_entity instanceof Grass ||
                        adjacent_entity instanceof Water
                    ) {
                        entities_found.push({
                            x: x,
                            y: y,
                            entity: adjacent_entity,
                        });
                    }
                }
            }
        }

        return entities_found;
    }

    checkOtherEntity() {
        for (let dx = -1; dx <= 1; dx++) {
            for (let dy = -1; dy <= 1; dy++) {
                if (dx === 0 && dy === 0) {
                    continue;
                }
                const x = this.x + dx;
                const y = this.y + dy;

                if (
                    x >= 0 &&
                    x < config.MATRIX_SIZE &&
                    y >= 0 &&
                    y < config.MATRIX_SIZE
                ) {
                    const adjacent_entity = Database.Entities[y][x];

                    if (
                        this instanceof Wolf &&
                        adjacent_entity instanceof Sheep
                    ) {
                        if (this.hungry >= this.hungry_to_move) {
                            adjacent_entity.life -= config.WOLF_DAMAGE;
                            this.hungry = 0;

                            if (adjacent_entity.life <= 0) {
                                adjacent_entity.cod = [this];
                            }
                        }
                    } else if (
                        adjacent_entity instanceof Grass &&
                        this instanceof Sheep
                    ) {
                        if (this.hungry >= this.hungry_to_move) { 
                            this.hungry = 0;
                        }
                    } else if (adjacent_entity instanceof Water) {
                        if (this.thirst >= this.thirst_to_move) {
                            this.thirst = 0;
                        }
                    } else if (
                        adjacent_entity instanceof Animal &&
                        adjacent_entity.type === this.type
                    ) {
                        if (
                            this.gender === "Male" &&
                            adjacent_entity.gender === "Female" &&
                            !adjacent_entity.pregnant &&
                            this.horny >= this.horny_to_move
                        ) {
                            if (!this.isRelative(adjacent_entity)) {
                                this.horny = 0;
                                let limit = pseudoRandom(
                                    adjacent_entity.babies_limit
                                );

                                limit =
                                    limit >
                                    Database.POPULATION_LIMIT -
                                        Database.AnimalsCount
                                        ? Database.POPULATION_LIMIT -
                                          Database.AnimalsCount
                                        : limit;

                                for (let i = 0; i < limit; i++) {
                                    if (
                                        Database.AnimalsCount <
                                        config.POPULATION_LIMIT
                                    ) {
                                        adjacent_entity.pregnant = true;
                                        let baby = this.createBaby();
                                        baby.generation =
                                            adjacent_entity.generation + 1;
                                        baby.mother = adjacent_entity;
                                        baby.father = this;
                                        adjacent_entity.babies.push(baby);
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    }

    moveTowards(target_x, target_y) {
        const dx = target_x - this.x;
        const dy = target_y - this.y;

        if (dx !== 0 || dy !== 0) {
            let new_x = this.x;
            let new_y = this.y;

            if (dx > 0) {
                new_x += 1;
            } else if (dx < 0) {
                new_x -= 1;
            }

            if (dy > 0) {
                new_y += 1;
            } else if (dy < 0) {
                new_y -= 1;
            }

            if (
                new_x >= 0 &&
                new_x < config.MATRIX_SIZE &&
                new_y >= 0 &&
                new_y < config.MATRIX_SIZE &&
                Database.Entities[new_y][new_x] instanceof Ground &&
                new_x !== this.lastPosition[0] &&
                new_y !== this.lastPosition[1]
            ) {
                let gr = new Ground();
                gr.newPosition(this.x, this.y);
                Database.Entities[this.y][this.x] = gr;

                this.newPosition(new_x, new_y);
                Database.Entities[new_y][new_x] = this;
                this.target_x = target_x;
                this.target_y = target_y;
            } else {
                this.randomMove();
            }
        }
    }

    randomMove() {
        if (this.target_x !== undefined && this.target_y !== undefined) {
            delete this.target_x;
            delete this.target_y;
        }

        const moves = [
            [0, -1],
            [0, 1],
            [-1, 0],
            [1, 0],
        ];
        let possible_moves = [];

        for (const [dx, dy] of moves) {
            const new_x = this.x + dx;
            const new_y = this.y + dy;

            if (
                new_x >= 0 &&
                new_x < config.MATRIX_SIZE &&
                new_y >= 0 &&
                new_y < config.MATRIX_SIZE &&
                Database.Entities[new_y][new_x] instanceof Ground
            ) {
                possible_moves.push([new_x, new_y]);
            }
        }

        if (possible_moves.length > 1) {
            const index = possible_moves.findIndex(
                ([x, y]) =>
                    x === this.lastPosition[0] && y === this.lastPosition[1]
            );
            if (index !== -1) {
                possible_moves.splice(index, 1);
            }
        }
        let new_x, new_y;
        if (possible_moves.length > 0) {
            [new_x, new_y] =
                possible_moves[pseudoRandom(possible_moves.length)];
            let gr = new Ground();
            gr.newPosition(this.x, this.y);
            Database.Entities[this.y][this.x] = gr;
            this.lastPosition = [this.x, this.y];
            this.newPosition(new_x, new_y);
            Database.Entities[new_y][new_x] = this;
            this.target_x = new_x;
            this.target_y = new_y;
        }
    }

    createBaby() {
        if (this instanceof Sheep) {
            return new Sheep();
        } else if (this instanceof Wolf) {
            return new Wolf();
        }
    }

    moveTowardsFood() {
        let nearest_food = null;
        let nearest_distance = Number.POSITIVE_INFINITY;

        for (
            let y = this.y - this.vision_range;
            y <= this.y + this.vision_range;
            y++
        ) {
            for (
                let x = this.x - this.vision_range;
                x <= this.x + this.vision_range;
                x++
            ) {
                if (
                    x >= 0 &&
                    x < config.MATRIX_SIZE &&
                    y >= 0 &&
                    y < config.MATRIX_SIZE
                ) {
                    const cell = Database.Entities[y][x];

                    if (
                        (this instanceof Sheep && cell instanceof Grass) ||
                        (this instanceof Wolf && cell instanceof Sheep)
                    ) {
                        const distance = this.calculateDistance(
                            this.x,
                            this.y,
                            x,
                            y
                        );
                        if (distance < nearest_distance) {
                            nearest_food = cell;
                            nearest_distance = distance;
                        }
                    }
                }
            }
        }

        if (nearest_food) {
            this.moveTowards(nearest_food.x, nearest_food.y);
            return true;
        } else {
            return false;
        }
    }
    moveTowardsWater() {
        let nearest_water = null;
        let nearest_distance = Number.POSITIVE_INFINITY;

        for (
            let y = this.y - this.vision_range;
            y <= this.y + this.vision_range;
            y++
        ) {
            for (
                let x = this.x - this.vision_range;
                x <= this.x + this.vision_range;
                x++
            ) {
                if (
                    x >= 0 &&
                    x < config.MATRIX_SIZE &&
                    y >= 0 &&
                    y < config.MATRIX_SIZE
                ) {
                    const cell = Database.Entities[y][x];
                    if (cell instanceof Water) {
                        const distance = this.calculateDistance(
                            this.x,
                            this.y,
                            x,
                            y
                        );
                        if (distance < nearest_distance) {
                            nearest_water = cell;
                            nearest_distance = distance;
                        }
                    }
                }
            }
        }

        if (nearest_water) {
            this.moveTowards(nearest_water.x, nearest_water.y);
            return true;
        } else {
            return false;
        }
    }

    isRelative(target) {
        if (!this.children[target.id] && !target.children[this.id]) {
            let isSiblings = false;

            if (this.mother) {
                if (
                    this.mother.children[target.id] ||
                    this.father.children[target.id]
                ) {
                    isSiblings = true;
                }
            }

            if (target.mother) {
                if (
                    target.mother.children[this.id] ||
                    target.father.children[this.id]
                ) {
                    isSiblings = true;
                }
            }

            if (!isSiblings) {
                return false;
            }
            return true;
        }

        return true;
    }

    moveTowardsMate() {
        let nearest_mate = null;
        let nearest_distance = Number.POSITIVE_INFINITY;

        for (
            let y = this.y - this.vision_range;
            y <= this.y + this.vision_range;
            y++
        ) {
            for (
                let x = this.x - this.vision_range;
                x <= this.x + this.vision_range;
                x++
            ) {
                if (
                    x >= 0 &&
                    x < config.MATRIX_SIZE &&
                    y >= 0 &&
                    y < config.MATRIX_SIZE
                ) {
                    const cell = Database.Entities[y][x];
                    let perfect_match = false;

                    if (
                        cell instanceof Animal &&
                        cell.id !== this.id &&
                        this.type === cell.type
                    ) {
                        if (
                            this.gender === "Male" &&
                            cell.gender === "Female" &&
                            !cell.pregnant
                        ) {
                            perfect_match = !this.isRelative(cell);
                        }
                    }

                    if (perfect_match === true) {
                        const distance = this.calculateDistance(
                            this.x,
                            this.y,
                            x,
                            y
                        );

                        if (distance < nearest_distance) {
                            nearest_mate = cell;
                            nearest_distance = distance;
                        }
                    }
                }
            }
        }

        if (nearest_mate) {
            this.moveTowards(nearest_mate.x, nearest_mate.y);
            return true;
        } else {
            return false;
        }
    }

    move() {
        this.ticks += 1;

        if (this.ticks >= config.GAME_SPEED) {
            if (this.ticks < this.speed) {
                return;
            }

            this.ticks = 0;

            if (this.life <= 0) {
                if (!this.cod) {
                    if (
                        this.hungry >= config.MAX_HUNGRY &&
                        this.thirst >= config.MAX_THIRST
                    ) {
                        this.cod = ["starvation", "dehydration"];
                    } else if (this.hungry >= config.MAX_HUNGRY) {
                        this.cod = ["starvation"];
                    } else if (this.thirst >= config.MAX_THIRST) {
                        this.cod = ["dehydration"];
                    } else {
                        this.cod = ["unknown"];
                    }
                }
                let gr = new Ground();
                gr.newPosition(this.x, this.y);
                Database.Entities[this.y][this.x] = gr;

                delete Database.Animals[this.id];
                Database.Deaths[this.id] = this;
                decrementAnimalCount(this);

                if (this.id === followedAnimalId) {
                    followedAnimalId = null;
                    followedAnimal = null;
                    entityId = null;
                    entityTarget = null;
                    CanvasMatrix.zoomLevel = Math.min(
                        canvas.width /
                            ((config.MATRIX_SIZE / 0.02) * paddingFactor),
                        canvas.height /
                            ((config.MATRIX_SIZE / 0.02) * paddingFactor)
                    );

                    CanvasMatrix.panY = 0;
                    CanvasMatrix.panX = 0;
                }

                return;
            }

            if (
                this.thirst >= this.thirst_to_move ||
                this.hungry >= this.hungry_to_move ||
                this.horny >= this.horny_to_move
            ) {
                const entities_around = this.checkSurroundings(
                    this.vision_range
                );

                if (entities_around) {
                    let has_water = false;
                    let has_food = false;
                    let has_mate = false;

                    if (this.thirst >= this.thirst_to_move) {
                        has_water = this.moveTowardsWater();
                    }

                    if (this.hungry >= this.hungry_to_move && !has_water) {
                        has_food = this.moveTowardsFood();
                    }

                    if (
                        this.horny >= this.horny_to_move &&
                        !has_water &&
                        !has_food
                    ) {
                        has_mate = this.moveTowardsMate();
                    }

                    if (!has_water && !has_food && !has_mate) {
                        this.randomMove();
                    }
                } else {
                    this.randomMove();
                }
            } else {
                this.randomMove();
            }

            this.checkOtherEntity();

            if (this.thirst >= config.MAX_THIRST && this.life >= 0) {
                this.life -= 1;
            }

            if (this.hungry >= config.MAX_HUNGRY && this.life >= 0) {
                this.life -= 1;
            }

            if (this.hungry !== config.MAX_HUNGRY) {
                this.hungry += 1;
            }

            if (this.thirst !== config.MAX_THIRST) {
                this.thirst += 1;
            }

            if (this.gender === "Male") {
                if (this.horny !== this.horny_to_move) {
                    this.horny += 1;
                }
            } else if (this.gender === "Female") {
                if (
                    this.pregnant &&
                    Database.AnimalsCount < config.POPULATION_LIMIT
                ) {
                    this.gestation_time -= 1;
                    if (this.gestation_time <= 0) {
                        this.gestation_time = this.default_gestation_time;
                        this.pregnant = false;

                        for (
                            let index = 0;
                            index < this.babies.length;
                            index++
                        ) {
                            if (
                                Database.AnimalsCount < config.POPULATION_LIMIT
                            ) {
                                const baby = this.babies[index];
                                if (add_entity(baby, true)) {
                                    Database.Animals[baby.id] = baby;
                                    baby.mother.children[baby.id] = baby;
                                    baby.father.children[baby.id] = baby;
                                }
                                {
                                    this.babies = [];
                                    break;
                                }
                            }
                        }
                        this.babies = [];
                    }
                }
            }

            if (this.life < 100 && this.hungry < 100 && this.thirst < 100) {
                this.life += 1;
            }

            if (this.gender === "Female") {
                if (
                    this.pregnant &&
                    Database.AnimalsCount >= config.POPULATION_LIMIT
                ) {
                    this.pregnant = false;
                }
            } else {
                if (
                    this.horny >= this.horny_to_move &&
                    Database.AnimalsCount >= config.POPULATION_LIMIT
                ) {
                    this.horny = 0;
                }
            }

            this.incrementSteps();
        }
    }
}

class Sheep extends Animal {
    constructor(type = "Sheep") {
        super();
        this.type = type;
        this.color = "#F5F5F5";
        this.borderColor = "#F5F5F5";
        this.textColor = "#000";
        this.life = config.SHEEP_LIFE;
        this.speed = config.SHEEP_SPEED;
        this.vision_range = config.SHEEP_VISION_RANGE;
        this.hungry_to_move = config.SHEEP_HUNGRY_TO_MOVE;
        this.thirst_to_move = config.SHEEP_THIRST_TO_MOVE;
        this.horny_to_move = config.SHEEP_HORNY_TO_MOVE;
        this.gestation_time = config.SHEEP_GESTATION_TIME;
        this.default_gestation_time = config.SHEEP_GESTATION_TIME;
        this.babies_limit = config.SHEEP_BIRTH_PROBABILITY;
    }

    toString() {
        return `[Sheep: ${this.id}]`;
    }
}

class Wolf extends Animal {
    constructor(type = "Wolf") {
        super();
        this.type = type;
        this.color = "#808080";
        this.borderColor = "#8B4513";
        this.textColor = "#fff";
        this.life = config.WOLF_LIFE;
        this.speed = config.WOLF_SPEED;
        this.vision_range = config.WOLF_VISION_RANGE;
        this.hungry_to_move = config.WOLF_HUNGRY_TO_MOVE;
        this.thirst_to_move = config.WOLF_THIRST_TO_MOVE;
        this.horny_to_move = config.WOLF_HORNY_TO_MOVE;
        this.gestation_time = config.WOLF_GESTATION_TIME;
        this.default_gestation_time = config.WOLF_GESTATION_TIME;
        this.babies_limit = config.WOLF_BIRTH_PROBABILITY;
    }

    toString() {
        return `[Wolf: ${this.id}]`;
    }
}

class Grass extends Entity {
    constructor() {
        super();
        this.textColor = "#fff";
        this.color = "#019608";
        this.borderColor = "#019608";
    }

    toString() {
        return `[Grass: ${this.id}]`;
    }
}

class Water extends Entity {
    constructor() {
        super();
        this.textColor = "#fff";
        this.color = "#3366CC";
        this.borderColor = "#3366CC";
    }

    toString() {
        return `[Water: ${this.id}]`;
    }
}

class Ground extends Entity {
    constructor() {
        super();

        this.color = "#014421";
        this.borderColor = "#2D915E";
    }

    toString() {
        return `[Ground: ${this.id}]`;
    }
}

function extractIntegerFromString(string) {
    const regex = /\d+/;
    const result = string.match(regex);
    return result !== null ? parseInt(result[0], 10) : null;
}

var typedKeys = "";
function selectTarget() {
    let typedKeysInt = extractIntegerFromString(typedKeys);
    if (typedKeysInt) {
        entityId = typedKeysInt;
        CanvasMatrix.zoomLevel = 1.0;
    }
}
const overlay = document.getElementById("overlay");

overlay.addEventListener("click", function () {
    overlay.style.display = "none";
    typedKeys = "";
});

document.addEventListener("keydown", function (event) {
    if (event.code === "KeyF") {
        entityId = null;
        entityTarget = null;
        getEntityInfo();
        CanvasMatrix.zoomLevel = Math.min(
            canvas.width / ((config.MATRIX_SIZE / 0.02) * paddingFactor),
            canvas.height / ((config.MATRIX_SIZE / 0.02) * paddingFactor)
        );

        CanvasMatrix.panY = 0;
        CanvasMatrix.panX = 0;
    } else if (event.key >= 0 && event.key <= 9 && !(event.key == " ")) {
        const isInputFocused = Array.from(inputs).some(
            (input) => input === document.activeElement
        );

        if (!isInputFocused) {
            overlay.style.display = "block";
            typedKeys += event.key;
            updateTypedKeys();
        }
    } else if (event.code == "Enter") {
        overlay.style.display = "none";
        selectTarget();
        typedKeys = "";
    } else if (event.key == "Backspace") {
        typedKeys = typedKeys.slice(0, -1);
        updateTypedKeys();
    } else if (event.key == " ") {
        event.preventDefault();
        paused = !paused;
        pauseResumeButton.textContent = paused ? "Continue" : "Pause";
    } else if (event.code === "KeyR") {
        generate();
    }
});






function handleMatrixZoom(event) {
    event.preventDefault(); 

    const zoomSpeed = 0.1; 

    
    const rect = canvas.getBoundingClientRect();
    const mouseX = event.clientX - rect.left;
    const mouseY = event.clientY - rect.top;

    
    const zoomFactor = event.deltaY < 0 ? 1 + zoomSpeed : 1 - zoomSpeed;

    
    const offsetX = (mouseX - CanvasMatrix.panX) * (zoomFactor - 1);
    const offsetY = (mouseY - CanvasMatrix.panY) * (zoomFactor - 1);
    CanvasMatrix.zoomLevel *= zoomFactor;
    CanvasMatrix.panX -= offsetX;
    CanvasMatrix.panY -= offsetY;

    
    CanvasMatrix.zoomCenterX = mouseX;
    CanvasMatrix.zoomCenterY = mouseY;

    
    drawMatrix();
}


function startMatrixDraggn(event) {
    CanvasMatrix.isDragging = true;
    CanvasMatrix.lastMouseX = event.clientX;
    CanvasMatrix.lastMouseY = event.clientY;
}


function stopMatrixDraggn() {
    CanvasMatrix.isDragging = false;
}


function handleMatrixDragging(event) {
    if (CanvasMatrix.isDragging) {
        const deltaX = event.clientX - CanvasMatrix.lastMouseX;
        const deltaY = event.clientY - CanvasMatrix.lastMouseY;

        CanvasMatrix.panX += deltaX;
        CanvasMatrix.panY += deltaY;

        CanvasMatrix.lastMouseX = event.clientX;
        CanvasMatrix.lastMouseY = event.clientY;

        drawMatrix();
    }
}
function is_full() {
    let land = 0;
    for (let y = 0; y < config.MATRIX_SIZE; y++) {
        for (let x = 0; x < config.MATRIX_SIZE; x++) {
            if (Database.Entities[y][x] instanceof Ground) {
                land++;
            }
        }
    }

    if ((land <= 0.2 * (config.MATRIX_SIZE * config.MATRIX_SIZE)) | 0) {
        return true;
    }

    return false;
}
var currentState;

const m = 4294967296; 
const a = 1664525; 
const c = 1013904223; 

function pseudoRandom(max) {
    
    if (!seed) {
        seed = generateSeed();
        seedSpan.innerHTML = seed;
    }

    currentState = (a * currentState + c) % m;
    return currentState % max;
}

function get_new_postion() {
    let land = []
    for (let y = 0; y < config.MATRIX_SIZE; y++) {
        for (let x = 0; x < config.MATRIX_SIZE; x++) {
            if (Database.Entities[y][x] instanceof Ground) {
                land.push({x:x, y:y})
            }
        }
    }

    if ((land.length <= 0.2 * (config.MATRIX_SIZE * config.MATRIX_SIZE)) | 0) {
        return false;
    }
    return land[pseudoRandom(land.length)]
}
function add_entity(entity, is_baby = false) {
    if (!(Database.AnimalsCount < config.POPULATION_LIMIT)) {
        return false;
    }

    let density = 1;
    
    while (true) {
        let position = get_new_postion();
        if (!position) {
            return false;
        }
        let y_random = position.y
        let x_random = position.x
        let rising_position = null;

        if (is_baby) {
            for (
                let y = Math.max(0, entity.mother.y - density);
                y < Math.min(config.MATRIX_SIZE - 1, entity.mother.y + density);
                y++
            ) {
                for (
                    let x = Math.max(0, entity.mother.x - density);
                    x <
                    Math.min(config.MATRIX_SIZE - 1, entity.mother.x + density);
                    x++
                ) {
                    if (
                        0 <= x &&
                        x < config.MATRIX_SIZE &&
                        0 <= y &&
                        y < config.MATRIX_SIZE &&
                        Database.Entities[y][x] instanceof Ground
                    ) {
                        rising_position = [y, x];
                        break;
                    }
                }
                if (rising_position) {
                    break;
                }
            }

            if (!rising_position) {
                is_baby = false;
            }
        }
        if (Database.Entities[y_random][x_random] instanceof Ground) {
            if (entity instanceof Grass || entity instanceof Water) {
                entity.newPosition(x_random, y_random);
                Database.Entities[y_random][x_random] = entity;
                
                let new_entity;
                
                if (entity instanceof Grass) {
                    new_entity = Grass;
                } else {
                    new_entity = Water;
                }

                let spots = [];
                for (
                    let y = Math.max(0, y_random - density);
                    y < Math.min(config.MATRIX_SIZE, y_random + density + 1);
                    y++
                ) {
                    for (
                        let x = Math.max(0, x_random - density);
                        x <
                        Math.min(config.MATRIX_SIZE, x_random + density + 1);
                        x++
                    ) {
                        if (
                            x >= 0 &&
                            x < config.MATRIX_SIZE &&
                            y >= 0 &&
                            y < config.MATRIX_SIZE &&
                            Database.Entities[y][x] instanceof Ground
                        ) {
                            if (pseudoRandom(10) < 7) {
                                spots.push({ x, y });
                            }
                        }
                    }
                }

                for (let index = 0; index < spots.length; index++) {
                    const spot = spots[index];
                    let new_entity_object = new new_entity();
                    new_entity_object.newPosition(spot.x, spot.y);
                    Database.Entities[spot.y][spot.x] = new_entity_object;
                }
                break;
            } else {
                if (is_baby) {
                    incrementAnimalCount(entity);
                    entity.newPosition(rising_position[1], rising_position[0]);
                    Database.Entities[rising_position[0]][rising_position[1]] =
                        entity;
                    Database.Animals[entity.id] = entity;
                    break;
                } else {
                    incrementAnimalCount(entity);
                    entity.newPosition(x_random, y_random);
                    Database.Entities[y_random][x_random] = entity;
                    Database.Animals[entity.id] = entity;
                    break;
                }
            }
        }
    }

    return true;
}






function drawMatrix() {
    lockCameraOnEntityTarget(); 

    CanvasMatrix.ctx.clearRect(0, 0, canvas.width, canvas.height); 
    const cellSize = 40 * CanvasMatrix.zoomLevel; 

    for (let i = 0; i < Database.Entities.length; i++) {
        for (let j = 0; j < Database.Entities[i].length; j++) {
            let ent = Database.Entities[i][j];
            let x = ent.x * cellSize + CanvasMatrix.panX;
            let y = ent.y * cellSize + CanvasMatrix.panY;
            let color = ent.color;
            

            if (entityTarget) {
                for (let point of entityTarget.path) {
                    if (i == point.y && j == point.x) {
                        color = "#02DE6C";
                    }
                }
                if (entityTarget.x == ent.x && entityTarget.y == ent.y) {
                    color = ent.color;
                }
            }

            
            CanvasMatrix.ctx.fillStyle = color;
            CanvasMatrix.ctx.fillRect(x, y, cellSize, cellSize);

            
            
            
            

            if (paused && ent instanceof Animal) {
                
                CanvasMatrix.ctx.fillStyle = ent.textColor;
                CanvasMatrix.ctx.font = `${
                    12 * CanvasMatrix.zoomLevel
                }px Consolas`;
                CanvasMatrix.ctx.textAlign = "center";
                CanvasMatrix.ctx.textBaseline = "middle";
                CanvasMatrix.ctx.fillText(
                    `${ent.id}`,
                    x + cellSize / 2,
                    y + cellSize / 2
                );
            }
        }
    }

    
    if (paused) {
        CanvasMatrix.ctx.fillStyle = "red";
        CanvasMatrix.ctx.font = "30px Consolas";
        let text = "PAUSED";
        const textWidth = 0;
        const textHeight = 0;
        const centerX = canvas.width / 2 - textWidth / 2;
        const centerY = canvas.height / 2 + textHeight / 2;

        if (Object.keys(Database.Animals).length === 0) {
            text = "Simulation Completed";

            if (!simulationCompleted) {
                simulationCompleted = true;
                createReport();
            }
        }

        CanvasMatrix.ctx.fillText(text, centerX, centerY);
    }
    if (entityTarget) {
        x = entityTarget.x * cellSize + CanvasMatrix.panX;
        y = entityTarget.y * cellSize + CanvasMatrix.panY;
        
        CanvasMatrix.ctx.beginPath();
        CanvasMatrix.ctx.strokeStyle = "red";
        CanvasMatrix.ctx.arc(
            x + cellSize / 2,
            y + cellSize / 2,
            entityTarget.vision_range * cellSize,
            0,
            2 * Math.PI
        );
        CanvasMatrix.ctx.stroke();

        if (
            entityTarget.target_x !== undefined &&
            entityTarget.target_y !== undefined
        ) {
            
            CanvasMatrix.ctx.beginPath();
            CanvasMatrix.ctx.strokeStyle = "red";
            CanvasMatrix.ctx.moveTo(x + cellSize / 2, y + cellSize / 2);
            CanvasMatrix.ctx.lineTo(
                entityTarget.target_x * cellSize +
                    CanvasMatrix.panX +
                    cellSize / 2,
                entityTarget.target_y * cellSize +
                    CanvasMatrix.panY +
                    cellSize / 2
            );
            CanvasMatrix.ctx.stroke();
        }
    }
}





var paused = true;

function countAliveSheep() {
    return Database.SheepsCount;
}

function countAliveWolves() {
    return Database.WolvesCount;
}

function countDeaths() {
    return Database.DeathsCount;
}

function displayAnimalsInfo() {
    const sheepCountContainer = document.getElementById("sheep-count");
    const wolfCountContainer = document.getElementById("wolf-count");
    const deathCountContainer = document.getElementById("death-count");

    const aliveSheepCount = countAliveSheep();
    const aliveWolfCount = countAliveWolves();
    const deathCount = countDeaths();

    sheepCountContainer.textContent = `Sheeps: ${aliveSheepCount}`;
    wolfCountContainer.textContent = `Wolves: ${aliveWolfCount}`;
    deathCountContainer.textContent = `Deaths: ${deathCount}`;
}

const canvasWidth = canvas.width;
const canvasHeight = canvas.height;
const centerCanvasX = canvasWidth / 2;
const centerCanvasY = canvasHeight / 2;


function lockCameraOnEntityTarget() {
    if (!entityTarget) return; 
    const cellSize = 40 * CanvasMatrix.zoomLevel; 

    
    const targetX = entityTarget.x * cellSize;
    const targetY = entityTarget.y * cellSize;
    const targetCenterX = targetX + cellSize / 2;
    const targetCenterY = targetY + cellSize / 2;

    const offsetX = centerCanvasX - targetCenterX;
    const offsetY = centerCanvasY - targetCenterY;

    
    CanvasMatrix.panX = offsetX;
    CanvasMatrix.panY = offsetY;
}


function getEntityInfo() {
    let entityInfoDiv = document.getElementById("entity-info");

    if (!entityId) {
        entityInfoDiv.innerHTML = "";
        entityInfoDiv.style.display = "none";
        return;
    }
    
    const entity = Object.values(Database.Animals).find(
        (animal) => animal.id === entityId
    );

    
    if (!entity) {
        return;
    }
    entityTarget = entity;

    
    if (entity.gender == "Female") {
        entityInfoDiv.innerHTML = `
        <p>ID: ${entity.id}</p>
        <p>Life: ${entity.life}</p>
        <p>Thirst: ${entity.thirst}</p>
        <p>Hungry: ${entity.hungry}</p>
        <p>Gender: ${entity.gender}</p>
        <p>Generation: ${entity.generation}</p>
        <p>Type: ${entity.type}</p>
        <p>Speed: ${entity.speed}</p>
        <p>Vision: ${entity.vision_range}</p>
        <p>Pregnant: ${entity.pregnant}</p>
        <p>Gestation Time: ${entity.gestation_time}</p>
        <p>Steps: ${entity.steps}</p>
        <p>Mother: ${entity.mother}</p>
        <p>Father: ${entity.father}</p>
      `;
    } else {
        entityInfoDiv.innerHTML = `
        <p>ID: ${entity.id}</p>
        <p>Life: ${entity.life}</p>
        <p>Thirst: ${entity.thirst}</p>
        <p>Hungry: ${entity.hungry}</p>
        <p>Gender: ${entity.gender}</p>
        <p>Generation: ${entity.generation}</p>
        <p>Type: ${entity.type}</p>
        <p>Speed: ${entity.speed}</p>
        <p>Vision: ${entity.vision_range}</p>
        <p>Horny: ${entity.horny}</p>
        <p>Steps: ${entity.steps}</p>
        <p>Mother: ${entity.mother}</p>
        <p>Father: ${entity.father}</p>
      `;
    }

    
    if (entityInfoDiv) {
        entityInfoDiv.remove();
    }

    
    document.body.appendChild(entityInfoDiv);
    entityInfoDiv.style.display = "inline";
}

var seed;

const seedInputElement = document.getElementById("seed-input");
seedInputElement.addEventListener("change", function () {
    const seedInt = extractIntegerFromString(seedInputElement.value);
    if (isNaN(seedInt)) {
        return;
    }
    seed = seedInt;
    generate();
});

const pauseResumeButton = document.getElementById("pause-resume-button");
pauseResumeButton.addEventListener("click", function () {
    paused = !paused; 
    pauseResumeButton.textContent = paused ? "Continue" : "Pause";
});

const resetButton = document.getElementById("reset-button");
resetButton.addEventListener("click", function () {
    generate();
});

var entityTarget = null;
function generate() {
    const seedInt = extractIntegerFromString(seedInputElement.value);
    if (seedInt) {
        seed = seedInt;
    } else {
        seed = false;
    }

    if (seed) {
        currentState = seed % m;
    } else {
        seed = generateSeed();
        currentState = seed % m;
    }
    seedSpan.innerHTML = seed;
    paused = true;
    pauseResumeButton.textContent = "Start";
    CanvasMatrix = {
        ctx: canvas.getContext("2d"),
        panX: 0,
        panY: 0,
        isDragging: false,
        zoomLevel: Math.min(
            canvas.width / ((config.MATRIX_SIZE / 0.02) * paddingFactor),
            canvas.height / ((config.MATRIX_SIZE / 0.02) * paddingFactor)
        ),
        
        zoomCenterX: 0,
        zoomCenterY: 0,

        
        lastMouseX: 0,
        lastMouseY: 0,
    };

    lastEntityId = 0;
    lastAnimalId = 0;
    followedAnimalId = null;
    entityId = null;
    entityTarget = null;
    matrix = null;
    Database = null;

    matrix = new Array(config.MATRIX_SIZE);
    for (let i = 0; i < config.MATRIX_SIZE; i++) {
        matrix[i] = new Array(config.MATRIX_SIZE);
    }
    Database = {
        Entities: matrix,
        Animals: {},
        Deaths: {},
        AnimalsCount: 0,
        DeathsCount: 0,
        SheepsCount: 0,
        WolvesCount: 0,
        Ticks: 0,
    };

    
    for (let y = 0; y < config.MATRIX_SIZE; y++) {
        for (let x = 0; x < config.MATRIX_SIZE; x++) {
            let gr = new Ground();
            gr.newPosition(x, y);
            Database.Entities[y][x] = gr;
        }
    }

    for (let i = 0; i < config.GRASS_NUMBER_GENERATION; i++) {
        const grass = new Grass();
        if (!add_entity(grass)) {
            break;
        }
    }

    for (let i = 0; i < config.WATER_NUMBER_GENERATION; i++) {
        const water = new Water();
        if (!add_entity(water)) {
            break;
        }
    }

    for (let i = 0; i < config.SHEEP_NUMBER_GENERATION; i++) {
        const sheep = new Sheep();
        if (!add_entity(sheep)) {
            break;
        }
    }

    for (let i = 0; i < config.WOLF_NUMBER_GENERATION; i++) {
        const wolf = new Wolf();
        if (!add_entity(wolf)) {
            break;
        }
    }
    const data = [
        { x: [], y: [], type: "scatter", name: "Sheeps" },
        {
            x: [],
            y: [],
            type: "scatter",
            name: "Wolves",
            line: { color: "red" },
        },
    ];
    const layout = {
        title: "Population Variation of Sheep and Wolves Over Time",
        xaxis: { title: "Ticks" },
        yaxis: { title: "Population" },
        showlegend: true,
        plot_bgcolor: "#1f1a33",
        paper_bgcolor: "#1f1a33",
    };
    displayAnimalsInfo();
    Plotly.react(chart, data);
    Plotly.newPlot(chart, data, layout);
}


function updateAnimation() {
    if (Object.keys(Database.Animals).length === 0) {
        paused = true;
    }

    if (!paused) {
        Database.Ticks++;
        for (animalID in Database.Animals) {
            const animal = Database.Animals[animalID];
            animal.move();
        }

        displayAnimalsInfo();
    }
    getEntityInfo();
    drawMatrix();
    requestAnimationFrame(updateAnimation);
}


canvas.addEventListener("wheel", handleMatrixZoom);
canvas.addEventListener("mousedown", startMatrixDraggn);
canvas.addEventListener("mousemove", handleMatrixDragging);
canvas.addEventListener("mouseup", stopMatrixDraggn);

function createConfigInputs() {
    var configInputsContainer = document.getElementById("config-inputs");

    
    var gridContainer = document.createElement("div");
    gridContainer.classList.add("grid-container");
    configInputsContainer.appendChild(gridContainer);

    
    var otherDiv = document.createElement("div");
    otherDiv.classList.add("config-category", "grid-item");
    gridContainer.appendChild(otherDiv);

    
    var sheepDiv = document.createElement("div");
    sheepDiv.classList.add("config-category", "grid-item");
    gridContainer.appendChild(sheepDiv);

    
    var wolfDiv = document.createElement("div");
    wolfDiv.classList.add("config-category", "grid-item");
    gridContainer.appendChild(wolfDiv);

    for (var key in config) {
        if (config[key]) {
            var inputLabel = document.createElement("label");
            inputLabel.textContent = key;
            inputLabel.title = configInfo[key]; 

            var inputElement = document.createElement("input");
            inputElement.type = "number";
            inputElement.placeholder = config[key];
            inputElement.id = key;
            inputElement.title = configInfo[key];
            inputElement.addEventListener("change", function () {
                config[this.id] = parseFloat(this.value);
                if (!this.id.includes("GAME_SPEED")) {
                    generate();
                }
            });

            
            if (key.includes("WOLF")) {
                wolfDiv.appendChild(inputLabel);
                wolfDiv.appendChild(inputElement);
                wolfDiv.appendChild(document.createElement("br"));
            } else if (key.includes("SHEEP")) {
                sheepDiv.appendChild(inputLabel);
                sheepDiv.appendChild(inputElement);
                sheepDiv.appendChild(document.createElement("br"));
            } else {
                otherDiv.appendChild(inputLabel);
                otherDiv.appendChild(inputElement);
                otherDiv.appendChild(document.createElement("br"));
            }
        }
    }
}

function exportConfig() {
    config["SEED"] = seed;
    var data = JSON.stringify(config, null, 2);
    var blob = new Blob([data], { type: "application/json" });
    var url = URL.createObjectURL(blob);
    var a = document.createElement("a");
    a.href = url;
    a.download = "config.json";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

const exportButton = document.getElementById("export-file");

exportButton.addEventListener("click", function () {
    exportConfig();
});

function updateInputs() {
    for (var key in config) {
        if (config[key]) {
            var inputElement = document.getElementById(key);
            if (inputElement) {
                inputElement.value = config[key];
            }
        }
    }
    generate();
}


function importConfig() {
    var fileInput = document.getElementById("import-file");
    var file = fileInput.files[0];
    var reader = new FileReader();
    reader.onload = function (event) {
        try {
            var importedConfig = JSON.parse(event.target.result);
            seed = importedConfig["SEED"];
            seedInputElement.value = seed;
            delete importedConfig.SEED;

            if (typeof importedConfig === "object") {
                Object.assign(config, importedConfig);
                updateInputs();
            } else {
                console.error("Invalid JSON file.");
            }
        } catch (error) {
            console.error("Error parsing JSON file:", error);
        }
    };

    reader.readAsText(file);
}

const configButton = document.getElementById("config-button");
const configContainer = document.getElementById("config-container");

function toggleConfigContainer() {
    if (configContainer.style.display === "none") {
        configContainer.style.display = "block";
        configContainer.scrollIntoView({ behavior: "smooth" });
    } else {
        configContainer.style.display = "none";
    }
}

configButton.addEventListener("click", toggleConfigContainer);

const infoIcon = document.getElementById("info");
const infoLabel = document.getElementById("info-label");

infoIcon.addEventListener("mouseover", () => {
    infoLabel.style.display = "block";
});

infoIcon.addEventListener("mouseout", () => {
    infoLabel.style.display = "none";
});

infoIcon.addEventListener("mousemove", (event) => {
    const x = event.clientX;
    const y = event.clientY;
    const labelWidth = infoLabel.offsetWidth;
    const windowWidth = window.innerWidth;

    
    if (x + labelWidth + 10 < windowWidth) {
        infoLabel.style.left = `${x + 10}px`;
    } else {
        infoLabel.style.left = `${x - labelWidth - 10}px`;
    }

    
    infoLabel.style.top = `${y + 10}px`;
});

function updateTypedKeys() {
    const typedKeysDiv = document.getElementById("typed-keys");
    typedKeysDiv.innerText = typedKeys;
}

const chart = document.getElementById("chart");

function updateChart() {
    Plotly.extendTraces(
        chart,
        { x: [[Database.Ticks]], y: [[Database.SheepsCount]] },
        [0]
    );
    Plotly.extendTraces(
        chart,
        { x: [[Database.Ticks]], y: [[Database.WolvesCount]] },
        [1]
    );
}

var svg;
var tree;
const width = 700;
const height = 600;
var isDragging = false;
var oldEntityId = null;

function createTree() {
    d3.select("#tree svg").remove();

    svg = d3
        .select("#tree")
        .append("svg")
        .attr("width", width)
        .attr("height", height)
        .call(d3.zoom().scaleExtent([0.1, 2]).on("zoom", zoomed)) 
        .append("g");

    tree = d3.tree().nodeSize([100, 100]);

    let cumulativeTransform = d3.zoomIdentity;

    function zoomed(event) {
        cumulativeTransform = event.transform;
        svg.attr("transform", cumulativeTransform);
    }

    let dragStartX, dragStartY;
    let previousTransform = d3.zoomIdentity;

    svg.on("mousedown", function (event) {
        isDragging = true;
        dragStartX = event.clientX;
        dragStartY = event.clientY;
        previousTransform = cumulativeTransform;
    });

    svg.on("mousemove", function (event) {
        if (isDragging) {
            const dx = event.clientX - dragStartX;
            const dy = event.clientY - dragStartY;
            const x = previousTransform.x + dx;
            const y = previousTransform.y + dy;
            svg.attr(
                "transform",
                `translate(${x}, ${y}) scale(${previousTransform.k})`
            );
        }
    });

    svg.on("mouseup", function () {
        isDragging = false;
    });
}

function createTreeChart(newData) {
    svg.selectAll("*").remove();

    const root = d3.hierarchy(newData);
    const links = tree(root).links();
    const descendants = root.descendants();

    
    const link = svg
        .selectAll(".link")
        .data(links)
        .enter()
        .append("path")
        .attr("class", "link")
        .attr(
            "d",
            d3
                .linkVertical()
                .x((d) => d.x)
                .y((d) => height - d.y)
        );

    const node = svg
        .selectAll(".node")
        .data(descendants)
        .enter()
        .append("g")
        .attr("class", "node")
        .attr("transform", (d) => `translate(${d.x},${height - d.y})`);

    node.append("circle")
        .attr("r", 4.5)
        .attr("fill", (d) => {
            if (d.data.name == entityId) {
                return "red";
            } else if (d.data.gender == "Female") {
                return "pink";
            } else if (d.data.gender == "Male") {
                return "blue";
            } else {
                return "black";
            }
        });

    node.filter((d) => d.children).raise();

    node.append("text")
        .attr("dy", "0.31em")
        .attr("x", (d) => (d.children ? -12 : 12))
        .attr("text-anchor", (d) => (d.children ? "end" : "start"))
        .text((d) => d.data.name);
}

const treeContainer = document.getElementById("tree-container");

function buildTreeData(data, id, depth = 0, maxDepth = 5) {
    if (depth > maxDepth || !id) return null;

    const nodeData = data.find((item) => item.id === id);
    if (!nodeData) return null;

    const node = {
        name: String(id),
        father: nodeData.father,
        mother: nodeData.mother,
        gender: nodeData.gender,
    };

    const childrenData = nodeData.children;
    if (childrenData && childrenData.length > 0) {
        node.children = childrenData
            .map((childId) => buildTreeData(data, childId, depth + 1, maxDepth))
            .filter((child) => child !== null);
    }

    return node;
}

function treeGenerator() {
    if (!entityTarget) {
        treeContainer.style.display = "none";
        return;
    }

    if (entityId != oldEntityId) {
        oldEntityId = entityId;
        createTree();
    }

    treeContainer.style.display = "block";

    const familyData = [];
    const seenNodes = new Set();
    const queue = [entityTarget];

    while (queue.length > 0) {
        const entity = queue.shift();

        if (!seenNodes.has(entity.id)) {
            seenNodes.add(entity.id);

            const children = [];
            if (entity.father) children.push(entity.father);
            if (entity.mother) children.push(entity.mother);

            familyData.push({
                id: entity.id,
                father: entity.father ? entity.father.id : null,
                mother: entity.mother ? entity.mother.id : null,
                gender: entity.gender || null,
                children: children.map((obj) => obj.id),
            });

            queue.push(...children);
        }
    }

    const newData = buildTreeData(familyData, familyData[0].id, 0, 11);
    createTreeChart(newData);
}

document
    .getElementById("reset-tree-button")
    .addEventListener("click", function () {
        createTree();
        treeGenerator();
    });

function createReport() {
    //
}

generate();
createConfigInputs();
requestAnimationFrame(updateAnimation);
const inputs = document.querySelectorAll("input");
setInterval(updateChart, 100);
setInterval(treeGenerator, 1000);

