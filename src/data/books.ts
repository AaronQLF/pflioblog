export type Motif = "grid" | "wave" | "orbit" | "bars" | "arc" | "field";

export interface Book {
    id: string;
    title: string;
    shortTitle: string;
    author: string;
    year: number;
    /** Why it is on the shelf. Shown in the inspect panel. */
    description: string;
    url: string;
    /** Cloth colour of the boards and spine. */
    cover: string;
    /** Foil colour: rules, motif, accent marks. */
    accent: string;
    /** Type colour on the cover. */
    ink: string;
    motif: Motif;
    /** Scene units. */
    height: number;
    thickness: number;
    /** Cover width as a fraction of height. */
    coverAspect: number;
}

export const SPINE_MARK = "HG";

export const BOOKS: Book[] = [
    {
        id: "vehicles",
        title: "Vehicles: Experiments in Synthetic Psychology",
        shortTitle: "Vehicles",
        author: "Valentino Braitenberg",
        year: 1984,
        description:
            "Fourteen toy machines, each one sensor and one wire more complex than the last, and by the end you are attributing fear and love to a cart with two photodiodes. The best argument I know that behaviour is cheaper to build than it looks from outside.",
        url: "https://www.goodreads.com/book/show/331910.Vehicles",
        cover: "#8c4a3f",
        accent: "#e6c89a",
        ink: "#f6ece0",
        motif: "orbit",
        height: 1.94,
        thickness: 0.19,
        coverAspect: 0.66,
    },
    {
        id: "blindsight",
        title: "Blindsight",
        shortTitle: "Blindsight",
        author: "Peter Watts",
        year: 2006,
        description:
            "Science fiction structured as a hostile argument that consciousness is a performance penalty rather than an achievement. I reread it every time an interpretability paper starts talking about verbalizable representations.",
        url: "https://www.goodreads.com/book/show/48484.Blindsight",
        cover: "#1e2a33",
        accent: "#5fb3c4",
        ink: "#e8f1f4",
        motif: "field",
        height: 2.16,
        thickness: 0.26,
        coverAspect: 0.64,
    },
    {
        id: "perceptrons",
        title: "Perceptrons",
        shortTitle: "Perceptrons",
        author: "Minsky & Papert",
        year: 1969,
        description:
            "Famous as the book that killed neural networks, which is mostly a misreading. What it contains is a careful theory of what a bounded-order machine cannot compute, and the questions it asks are the ones circuits work is asking again.",
        url: "https://www.goodreads.com/book/show/905462.Perceptrons",
        cover: "#5f6647",
        accent: "#d8c47a",
        ink: "#f2efdf",
        motif: "grid",
        height: 2.04,
        thickness: 0.24,
        coverAspect: 0.68,
    },
    {
        id: "rhythms-of-the-brain",
        title: "Rhythms of the Brain",
        shortTitle: "Rhythms of the Brain",
        author: "György Buzsáki",
        year: 2006,
        description:
            "Oscillations as the substrate rather than the epiphenomenon. Dense, opinionated, and the reason I stopped treating neural population activity as noise around a mean.",
        url: "https://www.goodreads.com/book/show/1050115.Rhythms_of_the_Brain",
        cover: "#a9702f",
        accent: "#f0dcb4",
        ink: "#fbf3e4",
        motif: "wave",
        height: 2.24,
        thickness: 0.28,
        coverAspect: 0.66,
    },
    {
        id: "jaynes",
        title: "Probability Theory: The Logic of Science",
        shortTitle: "Probability Theory",
        author: "E. T. Jaynes",
        year: 2003,
        description:
            "Unfinished, cranky, occasionally unfair to people who cannot answer back. Also the only book that turned the Bayesian argument into a question about which desiderata you are willing to give up rather than a tribal affiliation.",
        url: "https://www.goodreads.com/book/show/151848.Probability_Theory",
        cover: "#2f4038",
        accent: "#9ec9a6",
        ink: "#eef5ee",
        motif: "arc",
        height: 2.3,
        thickness: 0.32,
        coverAspect: 0.68,
    },
    {
        id: "mackay",
        title: "Information Theory, Inference, and Learning Algorithms",
        shortTitle: "Information Theory",
        author: "David MacKay",
        year: 2003,
        description:
            "Coding theory and machine learning taught as the same subject, which they are. The chapter ordering is deliberately non-linear and it works. Free online, which was the correct decision for a book this good.",
        url: "https://www.goodreads.com/book/show/13497.Information_Theory_Inference_and_Learning_Algorithms",
        cover: "#6c4f79",
        accent: "#e4c7f0",
        ink: "#f7effa",
        motif: "bars",
        height: 2.26,
        thickness: 0.33,
        coverAspect: 0.7,
    },
    {
        id: "strogatz",
        title: "Nonlinear Dynamics and Chaos",
        shortTitle: "Nonlinear Dynamics",
        author: "Steven Strogatz",
        year: 1994,
        description:
            "The book that makes phase portraits intuitive. I go back to the bifurcation chapters whenever a training curve does something abrupt and I want to remember that abrupt is not the same as discontinuous.",
        url: "https://www.goodreads.com/book/show/580469.Nonlinear_Dynamics_and_Chaos",
        cover: "#33556b",
        accent: "#8fd0e0",
        ink: "#ecf5f8",
        motif: "wave",
        height: 2.1,
        thickness: 0.25,
        coverAspect: 0.67,
    },
    {
        id: "proofs-from-the-book",
        title: "Proofs from THE BOOK",
        shortTitle: "Proofs from THE BOOK",
        author: "Aigner & Ziegler",
        year: 1998,
        description:
            "Erdős imagined a book where God keeps the perfect proof of every theorem. This is the human approximation. Best read one proof at a time, slowly, with nothing else open.",
        url: "https://www.goodreads.com/book/show/1173198.Proofs_from_THE_BOOK",
        cover: "#a2472f",
        accent: "#f2d0a8",
        ink: "#fbeee0",
        motif: "grid",
        height: 2.0,
        thickness: 0.21,
        coverAspect: 0.7,
    },
    {
        id: "trading-and-exchanges",
        title: "Trading and Exchanges",
        shortTitle: "Trading and Exchanges",
        author: "Larry Harris",
        year: 2002,
        description:
            "Market microstructure written by someone who cares more about why the plumbing exists than about what it pays. Nothing I read during the quant years changed how I looked at a fill more than this did.",
        url: "https://www.goodreads.com/book/show/1130176.Trading_and_Exchanges",
        cover: "#26313f",
        accent: "#c9a227",
        ink: "#eef1f5",
        motif: "bars",
        height: 2.32,
        thickness: 0.34,
        coverAspect: 0.69,
    },
    {
        id: "advances-in-fin-ml",
        title: "Advances in Financial Machine Learning",
        shortTitle: "Advances in Financial ML",
        author: "Marcos López de Prado",
        year: 2018,
        description:
            "Right about most of the failure modes, particularly backtest overfitting and the deficiencies of time bars. Overconfident about the fixes. Read it for the diagnosis, not the prescription.",
        url: "https://www.goodreads.com/book/show/38209388-advances-in-financial-machine-learning",
        cover: "#4f4a3e",
        accent: "#b8c48c",
        ink: "#f2f0e6",
        motif: "field",
        height: 2.08,
        thickness: 0.26,
        coverAspect: 0.68,
    },
    {
        id: "seeing-like-a-state",
        title: "Seeing Like a State",
        shortTitle: "Seeing Like a State",
        author: "James C. Scott",
        year: 1998,
        description:
            "About legibility: what gets lost when a system has to be made measurable from the centre before it can be managed. Applies to forestry, to cities, and to every metric anyone has ever asked me to optimise.",
        url: "https://www.goodreads.com/book/show/198672.Seeing_Like_a_State",
        cover: "#5d7050",
        accent: "#e0dba4",
        ink: "#f3f4e6",
        motif: "grid",
        height: 2.2,
        thickness: 0.29,
        coverAspect: 0.66,
    },
    {
        id: "hamming",
        title: "The Art of Doing Science and Engineering",
        shortTitle: "Science and Engineering",
        author: "Richard Hamming",
        year: 1997,
        description:
            "Transcribed lectures on how to pick problems that matter and then have the nerve to work on them. The lecture on why people who leave their door open do better work is the one I have quoted most often.",
        url: "https://www.goodreads.com/book/show/530415.The_Art_of_Doing_Science_and_Engineering",
        cover: "#8a6a2f",
        accent: "#f4e3b8",
        ink: "#fbf4e2",
        motif: "orbit",
        height: 2.14,
        thickness: 0.27,
        coverAspect: 0.67,
    },
];
