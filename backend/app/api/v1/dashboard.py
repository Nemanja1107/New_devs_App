from fastapi import APIRouter, Depends, HTTPException
from typing import Dict, Any, List
from app.services.cache import get_revenue_summary
from app.core.auth import authenticate_request as get_current_user

router = APIRouter()

@router.get("/dashboard/summary")
async def get_dashboard_summary(
    property_id: str,
    current_user: dict = Depends(get_current_user)
) -> Dict[str, Any]:
    
    tenant_id = getattr(current_user, "tenant_id", "default_tenant") or "default_tenant"
    
    revenue_data = await get_revenue_summary(property_id, tenant_id)
    
    total_revenue_float = revenue_data['total']
    
    return {
        "property_id": revenue_data['property_id'],
        "total_revenue": total_revenue_float,
        "currency": revenue_data['currency'],
        "reservations_count": revenue_data['count']
    }

@router.get("/dashboard/properties")
async def get_tenant_properties(
    current_user: dict = Depends(get_current_user)
) -> List[Dict[str, str]]:
    """Get properties for the current tenant"""
    
    tenant_id = getattr(current_user, "tenant_id", "default_tenant") or "default_tenant"
    
    try:
        from app.core.database_pool import DatabasePool
        from sqlalchemy import text
        
        db_pool = DatabasePool()
        await db_pool.initialize()
        
        if db_pool.session_factory:
            async with db_pool.get_session() as session:
                query = text("""
                    SELECT id, name 
                    FROM properties 
                    WHERE tenant_id = :tenant_id
                    ORDER BY name
                """)
                
                result = await session.execute(query, {"tenant_id": tenant_id})
                rows = result.fetchall()
                
                return [{"id": row.id, "name": row.name} for row in rows]
        else:
            raise Exception("Database not available")
            
    except Exception as e:
        print(f"Error fetching properties for tenant {tenant_id}: {e}")
        
        # Fallback mock data based on tenant
        if tenant_id == "tenant-a":
            return [
                {"id": "prop-001", "name": "Beach House Alpha"},
                {"id": "prop-002", "name": "City Apartment Downtown"},
                {"id": "prop-003", "name": "Country Villa Estate"}
            ]
        elif tenant_id == "tenant-b":
            return [
                {"id": "prop-001", "name": "Mountain Lodge Beta"},
                {"id": "prop-004", "name": "Lakeside Cottage"},
                {"id": "prop-005", "name": "Urban Loft Modern"}
            ]
        else:
            return []
