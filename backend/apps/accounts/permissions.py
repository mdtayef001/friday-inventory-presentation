"""Role rules. Mirrors frontend/src/lib/auth/roles.ts, so a route the
frontend hides is also refused here."""

from rest_framework.permissions import BasePermission

from .models import User

TEAM = (User.Role.OWNER, User.Role.MANAGER, User.Role.STAFF)
LEADS = (User.Role.OWNER, User.Role.MANAGER)


class IsSuperAdmin(BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.is_superadmin


class IsOwner(BasePermission):
    """The business owner, even while the business is locked."""

    def has_permission(self, request, view):
        user = request.user
        return user.is_authenticated and user.role == User.Role.OWNER and user.business_id is not None


class IsTenantMember(BasePermission):
    """A logged-in user of a business that is open (not suspended or being deleted).

    Views narrow this further with `allowed_roles`, `module` and
    `manager_permission` attributes.
    """

    message = "You don't have access to this."

    def has_permission(self, request, view):
        # Each refusal says why, so staff aren't told their business is locked when it isn't.
        user = request.user
        if not (user.is_authenticated and user.business_id and user.role in TEAM):
            return False
        business = user.business
        if not business.is_open:
            self.message = (
                "This business is being deleted." if business.status == "closing"
                else "Your business has been suspended."
            )
            return False

        roles = getattr(view, "allowed_roles", LEADS)
        if user.role not in roles:
            self.message = "You don't have access to this. Ask the owner if you need it."
            return False
        module = getattr(view, "module", None)
        if module and not business.module_on(module):
            self.message = "This feature is switched off in Business settings."
            return False
        return True


class ManagerNeedsPermission(BasePermission):
    """Writes by managers need the owner's switch named by `view.manager_permission`."""

    def has_permission(self, request, view):
        permission = getattr(view, "manager_permission", None)
        if not permission or request.method in ("GET", "HEAD", "OPTIONS"):
            return True
        if request.user.role == User.Role.MANAGER:
            return request.user.business.permission_on(permission)
        return True


def creatable_roles(user):
    """Which roles `user` may give inside their business. Only the Owner makes admins
    (more owner-level accounts); admins make managers and staff, managers make staff."""
    if user.role == User.Role.OWNER:
        if user.is_main_owner:
            return [User.Role.OWNER, User.Role.MANAGER, User.Role.STAFF]
        return [User.Role.MANAGER, User.Role.STAFF]
    if user.role == User.Role.MANAGER:
        return [User.Role.STAFF]
    return []


def allowed_location_ids(user):
    """None means every location (owners). Otherwise the user's assigned locations."""
    if user.role == User.Role.OWNER:
        return None
    return set(user.locations.values_list("id", flat=True))
