from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from app.models.contact import Contact
from app.models.deal import Deal
from app.models.task import Task
import uuid


def seed_example_data(db: Session, user_id: str):
    """Seed example data for a new user"""
    
    # Check if user already has data
    existing_contacts = db.query(Contact).filter(Contact.owner_id == user_id).first()
    if existing_contacts:
        return  # User already has data
    
    # Create example contacts
    contacts_data = [
        {
            "first_name": "John",
            "last_name": "Smith",
            "email": "john.smith@techcorp.com",
            "phone": "+1 (555) 123-4567",
            "company": "TechCorp Inc.",
            "job_title": "CTO",
            "city": "San Francisco",
            "country": "USA",
            "status": "customer",
            "source": "linkedin"
        },
        {
            "first_name": "Sarah",
            "last_name": "Johnson",
            "email": "sarah.j@innovate.io",
            "phone": "+1 (555) 234-5678",
            "company": "Innovate.io",
            "job_title": "VP of Engineering",
            "city": "New York",
            "country": "USA",
            "status": "prospect",
            "source": "referral"
        },
        {
            "first_name": "Michael",
            "last_name": "Chen",
            "email": "m.chen@globaltech.com",
            "phone": "+1 (555) 345-6789",
            "company": "GlobalTech Solutions",
            "job_title": "Director of IT",
            "city": "Seattle",
            "country": "USA",
            "status": "lead",
            "source": "website"
        },
        {
            "first_name": "Emma",
            "last_name": "Williams",
            "email": "emma.w@startup.co",
            "phone": "+1 (555) 456-7890",
            "company": "StartUp Co",
            "job_title": "CEO",
            "city": "Austin",
            "country": "USA",
            "status": "customer",
            "source": "conference"
        },
        {
            "first_name": "David",
            "last_name": "Brown",
            "email": "d.brown@enterprise.com",
            "phone": "+1 (555) 567-8901",
            "company": "Enterprise Solutions",
            "job_title": "Head of Procurement",
            "city": "Chicago",
            "country": "USA",
            "status": "prospect",
            "source": "cold_outreach"
        },
        {
            "first_name": "Lisa",
            "last_name": "Anderson",
            "email": "lisa.a@fintech.io",
            "phone": "+1 (555) 678-9012",
            "company": "FinTech Solutions",
            "job_title": "CFO",
            "city": "Boston",
            "country": "USA",
            "status": "lead",
            "source": "webinar"
        },
        {
            "first_name": "James",
            "last_name": "Wilson",
            "email": "j.wilson@cloudserv.com",
            "phone": "+1 (555) 789-0123",
            "company": "CloudServ Inc.",
            "job_title": "IT Manager",
            "city": "Denver",
            "country": "USA",
            "status": "customer",
            "source": "partner"
        },
        {
            "first_name": "Maria",
            "last_name": "Garcia",
            "email": "m.garcia@dataflow.io",
            "phone": "+1 (555) 890-1234",
            "company": "DataFlow Analytics",
            "job_title": "Data Director",
            "city": "Miami",
            "country": "USA",
            "status": "prospect",
            "source": "linkedin"
        }
    ]
    
    contacts = []
    for contact_data in contacts_data:
        contact = Contact(
            id=str(uuid.uuid4()),
            owner_id=user_id,
            **contact_data
        )
        db.add(contact)
        contacts.append(contact)
    
    db.flush()
    
    # Create example deals
    deals_data = [
        {
            "title": "TechCorp Enterprise License",
            "value": 150000.00,
            "stage": "closed_won",
            "probability": 100,
            "contact": contacts[0],
            "expected_close_date": datetime.utcnow() - timedelta(days=10),
            "actual_close_date": datetime.utcnow() - timedelta(days=5)
        },
        {
            "title": "Innovate.io Platform Integration",
            "value": 75000.00,
            "stage": "negotiation",
            "probability": 70,
            "contact": contacts[1],
            "expected_close_date": datetime.utcnow() + timedelta(days=14)
        },
        {
            "title": "GlobalTech Pilot Program",
            "value": 25000.00,
            "stage": "proposal",
            "probability": 50,
            "contact": contacts[2],
            "expected_close_date": datetime.utcnow() + timedelta(days=30)
        },
        {
            "title": "StartUp Co Annual Contract",
            "value": 48000.00,
            "stage": "closed_won",
            "probability": 100,
            "contact": contacts[3],
            "expected_close_date": datetime.utcnow() - timedelta(days=20),
            "actual_close_date": datetime.utcnow() - timedelta(days=18)
        },
        {
            "title": "Enterprise Solutions Expansion",
            "value": 200000.00,
            "stage": "qualified",
            "probability": 30,
            "contact": contacts[4],
            "expected_close_date": datetime.utcnow() + timedelta(days=60)
        },
        {
            "title": "FinTech Implementation",
            "value": 95000.00,
            "stage": "lead",
            "probability": 10,
            "contact": contacts[5],
            "expected_close_date": datetime.utcnow() + timedelta(days=90)
        },
        {
            "title": "CloudServ Renewal",
            "value": 36000.00,
            "stage": "negotiation",
            "probability": 80,
            "contact": contacts[6],
            "expected_close_date": datetime.utcnow() + timedelta(days=7)
        },
        {
            "title": "DataFlow Analytics Suite",
            "value": 120000.00,
            "stage": "proposal",
            "probability": 40,
            "contact": contacts[7],
            "expected_close_date": datetime.utcnow() + timedelta(days=45)
        }
    ]
    
    for deal_data in deals_data:
        contact = deal_data.pop("contact")
        deal = Deal(
            id=str(uuid.uuid4()),
            owner_id=user_id,
            contact_id=contact.id,
            **deal_data
        )
        db.add(deal)
    
    # Create example tasks
    tasks_data = [
        {
            "title": "Follow up with Sarah Johnson",
            "description": "Discuss platform integration requirements and timeline",
            "task_type": "call",
            "priority": "high",
            "status": "pending",
            "due_date": datetime.utcnow() + timedelta(days=1),
            "contact": contacts[1]
        },
        {
            "title": "Send proposal to GlobalTech",
            "description": "Prepare and send detailed proposal for pilot program",
            "task_type": "email",
            "priority": "high",
            "status": "in_progress",
            "due_date": datetime.utcnow() + timedelta(days=2),
            "contact": contacts[2]
        },
        {
            "title": "Schedule demo with Enterprise Solutions",
            "description": "Set up product demo for the procurement team",
            "task_type": "meeting",
            "priority": "medium",
            "status": "pending",
            "due_date": datetime.utcnow() + timedelta(days=5),
            "contact": contacts[4]
        },
        {
            "title": "Review CloudServ contract terms",
            "description": "Review renewal terms and prepare counter-offer",
            "task_type": "task",
            "priority": "high",
            "status": "pending",
            "due_date": datetime.utcnow() + timedelta(days=3),
            "contact": contacts[6]
        },
        {
            "title": "Quarterly business review with TechCorp",
            "description": "Prepare QBR presentation and schedule meeting",
            "task_type": "meeting",
            "priority": "medium",
            "status": "pending",
            "due_date": datetime.utcnow() + timedelta(days=14),
            "contact": contacts[0]
        },
        {
            "title": "Update CRM with new lead info",
            "description": "Add notes from FinTech discovery call",
            "task_type": "task",
            "priority": "low",
            "status": "completed",
            "is_completed": True,
            "completed_at": datetime.utcnow() - timedelta(days=1),
            "contact": contacts[5]
        },
        {
            "title": "Send thank you note to StartUp Co",
            "description": "Thank them for signing the annual contract",
            "task_type": "email",
            "priority": "low",
            "status": "completed",
            "is_completed": True,
            "completed_at": datetime.utcnow() - timedelta(days=2),
            "contact": contacts[3]
        },
        {
            "title": "Research DataFlow competitors",
            "description": "Prepare competitive analysis for the proposal",
            "task_type": "task",
            "priority": "medium",
            "status": "pending",
            "due_date": datetime.utcnow() + timedelta(days=7),
            "contact": contacts[7]
        }
    ]
    
    for task_data in tasks_data:
        contact = task_data.pop("contact")
        task = Task(
            id=str(uuid.uuid4()),
            owner_id=user_id,
            contact_id=contact.id,
            **task_data
        )
        db.add(task)
    
    db.commit()
