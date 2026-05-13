from kafka import KafkaProducer
from app.config import settings

_producer = None

from kafka import KafkaProducer
from app.config import settings

_producer = None

def get_producer():
    global _producer
    if _producer is None:
        try:
            _producer = KafkaProducer(
                bootstrap_servers=settings.KAFKA_BOOTSTRAP_SERVERS,
                value_serializer=lambda v: str(v).encode('utf-8'),
                security_protocol="SASL_SSL",
                sasl_mechanism="SCRAM-SHA-256",
                sasl_plain_username=settings.KAFKA_USERNAME,
                sasl_plain_password=settings.KAFKA_PASSWORD,
                api_version=(3, 7, 0)
            )
        except Exception as e:
            print(f"Warning: Kafka not available — {e}")
            return None
    return _producer

def publish_assessment_completed(execution_id: int, session_id: str):
    producer = get_producer()
    if producer:
        producer.send("assessment.completed", f"{execution_id}:{session_id}")

def publish_score_generated(execution_id: int, overall_score: float, classification: str):
    producer = get_producer()
    if producer:
        producer.send("score.generated", f"{execution_id}:{overall_score}:{classification}")

def publish_classification_assigned(execution_id: int, classification: str):
    producer = get_producer()
    if producer:
        producer.send("classification.assigned", f"{execution_id}:{classification}")

def publish_score_generated_full(
    execution_id: int,
    startup_user_id: int,
    financial_health: float,
    team_strength: float,
    market_potential: float,
    business_viability: float,
    overall_score: float,
    classification: str,
    ai_reasoning: str,
    company_size: str,
    problem_statement: str,
    business_model: str,
    target_market: str,
    funding_needed: float
):
    producer = get_producer()
    if producer:
        safe_reasoning = ai_reasoning.replace(":", " ").replace("\n", " ")
        safe_problem = problem_statement.replace(":", " ").replace("\n", " ")
        safe_model = business_model.replace(":", " ").replace("\n", " ")
        safe_market = target_market.replace(":", " ").replace("\n", " ")
        safe_size = str(company_size).replace(":", " ")

        message = ":".join([
            str(execution_id),
            str(startup_user_id),
            str(financial_health),
            str(team_strength),
            str(market_potential),
            str(business_viability),
            str(overall_score),
            classification,
            safe_reasoning,
            safe_size,
            safe_problem,
            safe_model,
            safe_market,
            str(funding_needed)
        ])
        producer.send("score.generated.full", message)