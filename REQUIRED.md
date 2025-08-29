### **High-Level Summary**

This document outlines the resource and data management requirements for a High-Performance Computing (HPC) system. The system allocates compute and storage resources to **Projects**, which are owned by **Principal Investigators (PIs)**. The framework includes distinct resource allocation models, a **Default Project** system for overdrafts, and a flexible **Resource Sharing** mechanism. It also defines key user roles—the **Resource Manager** and the **Data Steward**—to delegate management of project allocations and secure **Data Shares**, respectively.

### **1. Key Concepts**

*   **Principal Investigator (PI):** The primary user role. A PI is the owner of one or more Projects and is ultimately responsible for their funding and management.
*   **Project:** The central unit for organizing work. Each Project is owned by a PI, linked to a billing method, and has a specific allocation of resources.
*   **Resource Manager:** A user assigned to a Project with permissions to manage its resource allocations, budgets, and sharing configurations. If this role is not explicitly assigned, the PI serves as the default Resource Manager.
*   **Data Steward:** A user (often a staff scientist) responsible for managing the data and access controls for a specific **Data Share**. The Data Steward role has a clear hierarchy for how it is assigned.
*   **Data Share:** A partitioned space within a Project's storage allocation, linked to a specific security group and managed by a Data Steward. It provides a mechanism for secure, controlled data collaboration.
*   **Resources:** The consumable assets on the HPC system, such as:
    *   CPU Core-Hours
    *   Terabytes (TB) of storage per month (e.g., S3-like, POSIX, database)
    *   GPU Hours
    *   Software license tokens per month
*   **Allocation:** The amount of a resource assigned to a Project for a specific time frame.

### **2. Core Requirements**

#### **2.1. Project and PI Management**
*   Each Project must be owned by exactly one PI.
*   A PI can own multiple Projects.
*   Every Project must be linked to a valid payment method for billing purposes.

#### **2.2. Resource Allocation Models**
Resources are allocated to Projects in one of two ways:

1.  **Subscription Model:** A specific quantity of a resource is allocated for a recurring time frame.
    *   *Example:* 10,000 CPU core-hours per month; 50 TB of storage per month.

2.  **Ownership Model (Condo):** A fixed quantity of a resource is purchased outright and allocated for a long-term duration.
    *   *Example:* A purchased compute node grants the Project exclusive access to its cores and RAM for a 60-month period.

#### **2.3. The "Default Project" Mechanism**
This mechanism acts as a safety net for a PI's projects.

*   A PI can designate **one** of their Projects as their "Default Project."
*   **Function:** If one of the PI's *non-default* Projects attempts to consume resources but has an insufficient allocation, the system will automatically try to draw the needed resources from that PI's Default Project.
*   **Condition:** This automatic drawing only occurs if the Default Project has a sufficient allocation of the requested resource.
*   **Important Exception:** If a PI has **not** designated a Default Project, their other projects cannot draw resources from one another. In this case, a job from a project with insufficient resources will fail.

#### **2.4. Resource Sharing Mechanism**
This mechanism allows for collaboration by letting projects share their allocations.

*   Any Project (the "Source Project") can share a percentage of its allocated resources with one or more other "Recipient Projects."
*   Recipient Projects can be owned by the same PI or by a different PI.
*   **Sharing Limit:** A Source Project can share a maximum of **99%** of any given resource. It must always retain at least 1% of its own allocation.

There are two modes for configuring resource sharing:

1.  **Uniform Sharing (Default):** A single percentage is applied to all shared resources.
    *   *Example:* Project A shares **20%** of its allocation with Project B. Project B can now use up to 20% of Project A's CPU-hours, 20% of its storage, and 20% of its tokens.

2.  **Granular Sharing (Configurable):** The sharing percentage can be defined individually for each resource type.
    *   *Example:* Project A shares resources with Project C, configured as:
        *   **10%** of its CPU core-hours
        *   **50%** of its storage allocation
        *   **0%** of its license tokens

#### **2.5. User Roles and Responsibilities**

1.  **Resource Manager:**
    *   **Purpose:** To manage the resource allocations and sharing rules for a specific Project.
    *   **Assignment:** The role can be assigned to any user on a per-project basis.
    *   **Default Behavior:** If no Resource Manager is explicitly assigned to a Project, the Project's **PI** automatically assumes these responsibilities.

2.  **Data Steward:**
    *   **Purpose:** To manage the data lifecycle and access control for Data Shares by managing the membership of the associated security group.
    *   **Assignment Hierarchy (in order of precedence):**
        1.  **Data Share Level:** A user can be assigned as the Data Steward for one specific Data Share, overriding any project-level settings.
        2.  **Project Level (Default):** A user can be assigned as the "Default Data Steward" for an entire Project. They will manage all Data Shares within that project unless overridden at the share level.
        3.  **PI as Fallback:** If no Data Steward is assigned at either the share or project level, the Project's **PI** automatically serves as the Data Steward.

#### **2.6. Data Share Management**
Projects can partition their storage allocations into discrete **Data Shares** to facilitate secure collaboration.

*   **Key Properties of a Data Share:**
    *   It is created from a single, specific storage-type resource allocation belonging to the Project.
    *   It has a defined storage sub-type (e.g., S3-like, database, POSIX).
    *   Its maximum size (quota) is equal to the size of the storage allocation it was created from.
    *   Access is controlled by an associated security group.

*   **Security and Access Control:**
    1.  **Project-Level Group:** When a new Project is created, the system must **automatically create a default security group** for it (e.g., in LDAP or Grouper).
    2.  **Default Share Access:** By default, when a new Data Share is created, it is **automatically assigned access control via this Project-level security group**.
    3.  **Customized Share Access (Override):** The Data Steward has the option to create a dedicated security group for a specific Data Share. When this action is taken:
        *   The system will **automatically create a new, unique security group named after the Data Share**.
        *   This new, share-specific group will replace the project-level group as the access control mechanism for that Data Share.
    4.  **Membership Management:** The Data Steward is responsible for managing the membership of the relevant security group (either the project-level default or the share-specific one) to grant or revoke user access to the data.

*   **Creation Workflow:**
    1.  The user (e.g., Resource Manager or PI) selects a parent Project to create a Data Share within.
    2.  They choose one of the Project's available **storage-type resource allocations**.
    3.  The system sets the Data Share's storage quota to the full size of that allocation.
    4.  The system automatically associates the new Data Share with the Project's default security group.
    5.  The Data Steward for the share is determined by the hierarchy defined in section 2.5. The steward can later choose to create a dedicated security group for this share.