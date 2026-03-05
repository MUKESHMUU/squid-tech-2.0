// ==========================================
// SQUID TECH: 30 Technical Event MCQ Questions
// ==========================================
// Format: {id, scenario, question, options, correctAnswer (as index)}

const GAME_SCENARIOS = [
    {
        id: 1,
        scenario: "A cloud server runs four processes P1, P2, P3 and P4. Process P1 holds resource R1 and waits for R2. P2 holds R2 and waits for R3. P3 holds R3 and waits for R4. P4 holds R4 and waits for R1. None can proceed.",
        question: "What is the primary OS problem occurring here?",
        options: ["Starvation", "Deadlock", "Thrashing", "Context Switching"],
        correctAnswer: 1
    },
    {
        id: 2,
        scenario: "A web server has 8GB RAM. When traffic spikes, the operating system constantly swaps pages between RAM and disk. This causes severe performance degradation even though CPU usage is low.",
        question: "What phenomenon is occurring?",
        options: ["Memory leak", "Thrashing", "Page fragmentation", "Cache miss"],
        correctAnswer: 1
    },
    {
        id: 3,
        scenario: "Process A with high priority continuously arrives at a CPU queue. Process B with lower priority has been waiting for 10 minutes but never gets CPU time.",
        question: "What starvation prevention technique should be used?",
        options: ["Round-robin scheduling", "Aging", "Preemption", "Batch processing"],
        correctAnswer: 1
    },
    {
        id: 4,
        scenario: "A database transaction reads a value X=10, increments it to 11, but another transaction reads the old value 10 simultaneously before the write completes.",
        question: "What concurrency issue occurred?",
        options: ["Dirty read", "Lost update", "Phantom read", "Non-repeatable read"],
        correctAnswer: 0
    },
    {
        id: 5,
        scenario: "A REST API has 5000 requests/minute. Each request takes 10ms average. The server has 500 available threads. After 50 seconds, new requests start getting rejected immediately.",
        question: "What is the most likely cause?",
        options: ["Memory exhaustion", "Thread pool exhaustion", "Network bandwidth limit", "Disk I/O bottleneck"],
        correctAnswer: 1
    },
    {
        id: 6,
        scenario: "A critical system experiences complete failure because the load balancer was not updated when a new server was added. The load balancer still thinks the old 4 servers handle all traffic.",
        question: "What failure pattern is this?",
        options: ["Byzantine failure", "Configuration drift", "Cascading failure", "Split-brain"],
        correctAnswer: 1
    },
    {
        id: 7,
        scenario: "A TCP connection between client and server exchanges 3-way handshake successfully. Data flows fine. After 30 minutes of idle time, the client tries to send data but gets no response.",
        question: "What network issue likely occurred?",
        options: ["TCP timeout", "NAT gateway reset connection", "Packet loss", "DNS failure"],
        correctAnswer: 1
    },
    {
        id: 8,
        scenario: "A microservice processes requests in a specific order: Service A -> Service B -> Service C. Service B crashes, but Service A and C continue running. Requests to A succeed but fail at B.",
        question: "What resilience pattern was not implemented?",
        options: ["Rate limiting", "Circuit breaker", "Load balancing", "Caching"],
        correctAnswer: 1
    },
    {
        id: 9,
        scenario: "A database query joins 5 large tables with no indexes. The query takes 45 seconds on first run. On second run, it takes 3 seconds without code changes.",
        question: "What optimization happened implicitly?",
        options: ["Query rewriting", "Plan caching", "Result caching", "Parallel execution"],
        correctAnswer: 1
    },
    {
        id: 10,
        scenario: "Two database transactions try to update the same row. Transaction 1 gets a shared lock, Transaction 2 needs an exclusive lock. Both are blocked indefinitely trying to upgrade.",
        question: "What is this deadlock scenario called?",
        options: ["Hold and wait", "Circular wait", "Lock escalation deadlock", "Livelock"],
        correctAnswer: 2
    },
    {
        id: 11,
        scenario: "A cache stores customer session data. During peak traffic, the cache reaches max capacity at 10GB. New sessions cannot be stored. The system administrator must decide which sessions to evict.",
        question: "What caching policy decision is needed?",
        options: ["LRU eviction", "FIFO eviction", "TTL setting", "Write-through strategy"],
        correctAnswer: 0
    },
    {
        id: 12,
        scenario: "A file server replicates data across 3 nodes. During write, it waits for all 3 nodes to acknowledge. If any node fails, the entire write fails even if 2 nodes succeed.",
        question: "What consistency model is this?",
        options: ["Eventual consistency", "Strong consistency", "Causal consistency", "Read-after-write"],
        correctAnswer: 1
    },
    {
        id: 13,
        scenario: "An API rate limiter allows 1000 requests/minute per IP. Requests arrive in bursts of 500 every 12 seconds. Some burst requests are rejected even though average is below limit.",
        question: "What advanced rate limiting would help?",
        options: ["Token bucket", "Sliding window", "Leaky bucket", "Fixed window"],
        correctAnswer: 0
    },
    {
        id: 14,
        scenario: "A garbage collector pauses the entire application for 2 seconds every 30 seconds to reclaim memory. The application is a stock trading system that cannot tolerate 2s pauses.",
        question: "What garbage collection improvement is needed?",
        options: ["Generational GC", "Incremental GC", "Concurrent GC", "Mark-and-sweep"],
        correctAnswer: 2
    },
    {
        id: 15,
        scenario: "A distributed system uses IP addresses for node identification. When nodes restart with new IPs, consensus breaks because old addresses are hardcoded in configuration.",
        question: "What architectural pattern prevents this?",
        options: ["Service mesh", "Service discovery", "Load balancing", "DNS aliasing"],
        correctAnswer: 1
    },
    {
        id: 16,
        scenario: "A backup process completes successfully daily, but when tested, the backup cannot restore to the original state. Files are missing or corrupted.",
        question: "What is being neglected?",
        options: ["Backup compression", "Backup verification", "Incremental backup", "Off-site backup"],
        correctAnswer: 1
    },
    {
        id: 17,
        scenario: "Two services communicate via REST. Service A calls Service B, which calls Service C, which calls A back. This creates a circular dependency at runtime.",
        question: "What architecture problem is this?",
        options: ["Tight coupling", "Circular dependency", "Missing abstraction", "God object"],
        correctAnswer: 1
    },
    {
        id: 18,
        scenario: "A packet sent from source to destination takes 50ms over direct path or 55ms via backup path. The network switches between paths every 100 packets causing disorder.",
        question: "What protocol feature can prevent out-of-order handling?",
        options: ["Windowing", "Sequencing", "Acknowledgments", "Checksums"],
        correctAnswer: 1
    },
    {
        id: 19,
        scenario: "A memory-intensive application allocates 100MB chunks repeatedly. After 48 hours, available memory fragments into many small pieces. Large allocations start failing.",
        question: "What is the underlying problem?",
        options: ["Memory leak", "Heap fragmentation", "Swapping", "Buffer overflow"],
        correctAnswer: 1
    },
    {
        id: 20,
        scenario: "A log aggregation system loses logs during network partitions between the server and agent. Critical error logs are missing from the final log store.",
        question: "What durability mechanism is missing?",
        options: ["Replication", "Local buffering", "Compression", "Encryption"],
        correctAnswer: 1
    },
    {
        id: 21,
        scenario: "Database statistics show that a frequently used index is never actually used by the query optimizer. The index consumes 5GB of storage and slows down inserts.",
        question: "What data structure decision was incorrect?",
        options: ["Wrong index type", "Over-indexing", "Index fragmentation", "Column selectivity"],
        correctAnswer: 1
    },
    {
        id: 22,
        scenario: "A system processes 10000 events per second. Events are written to a single database table with a sequentially incrementing primary key, causing contention.",
        question: "What key generation strategy would scale better?",
        options: ["UUID", "Timestamp", "Snowflake ID", "Hash-based partitioning"],
        correctAnswer: 0
    },
    {
        id: 23,
        scenario: "An application uses a single-threaded event loop. When processing a CPU-intensive task, all network requests timeout because the loop cannot accept new events.",
        question: "What pattern would prevent blocking?",
        options: ["Worker threads", "Async/await", "Thread pooling", "Callback queue"],
        correctAnswer: 0
    },
    {
        id: 24,
        scenario: "A NoSQL database spreads data across 10 nodes with replication factor 3. One node fails. The data is still accessible but with reduced performance due to uneven distribution.",
        question: "What rebalancing process should occur?",
        options: ["Resharding", "Recompacting", "Defragmentation", "Reconstruction"],
        correctAnswer: 0
    },
    {
        id: 25,
        scenario: "An HTTP/1.1 client makes 100 requests to the same server sequentially. Each request opens a new TCP connection because keep-alive is disabled.",
        question: "What HTTP feature reduces overhead?",
        options: ["Pipelining", "Multiplexing", "Keep-alive", "Compression"],
        correctAnswer: 2
    },
    {
        id: 26,
        scenario: "A cryptographic key is hardcoded in source code and committed to git. The code is open-sourced, exposing the key to everyone. The key is now compromised.",
        question: "What best practice was violated?",
        options: ["Key rotation", "Key separation", "Secure storage", "Access control"],
        correctAnswer: 2
    },
    {
        id: 27,
        scenario: "A system monitors CPU, memory, and disk usage but ignores network I/O saturation. The application works fine locally but fails when deployed with high network traffic.",
        question: "What observability gap exists?",
        options: ["Missing metrics", "Insufficient sampling", "No tracing", "Incomplete profiling"],
        correctAnswer: 0
    },
    {
        id: 28,
        scenario: "A test environment exactly mirrors production with same hardware, OS, and versions. Tests pass in staging but fail in production under real load.",
        question: "What testing scenario was not covered?",
        options: ["Regression test", "Load test", "Integration test", "Unit test"],
        correctAnswer: 1
    },
    {
        id: 29,
        scenario: "A container image is 2GB because it includes all development tools, source code, and test files. Pulling this image takes 10 minutes, slowing down deployment.",
        question: "What container best practice should be applied?",
        options: ["Layer caching", "Multi-stage builds", "Image signing", "Registry mirroring"],
        correctAnswer: 1
    },
    {
        id: 30,
        scenario: "A system recovers from failure by restarting all services simultaneously. During recovery, the database is flooded with reconnection requests and becomes overloaded.",
        question: "What failure recovery pattern would help?",
        options: ["Exponential backoff", "Circuit breaker", "Bulkhead isolation", "Graceful degradation"],
        correctAnswer: 0
    }
];


