import { useState } from 'react';
import styles from './ServicesView.module.css';
import ServiceModal from '../components/ServiceModal';
import { useServices } from '../hooks/useServices';

export default function ServicesView({ businessId }) {
  const [selectedService, setSelectedService] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');

  const {
    services,
    categories,
    isLoading,
    error,
    createService,
    updateService,
    deleteService,
    refreshServices
  } = useServices(businessId);

  // Filter services
  const filteredServices = services?.filter(service => {
    const matchesSearch = service.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         service.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === 'all' || service.category === filterCategory;
    return matchesSearch && matchesCategory;
  }) || [];

  const handleCreateService = () => {
    setSelectedService({ isNew: true });
    setIsModalOpen(true);
  };

  const handleEditService = (service) => {
    setSelectedService(service);
    setIsModalOpen(true);
  };

  const handleModalSave = async (serviceData) => {
    try {
      if (selectedService?.isNew) {
        await createService(serviceData);
      } else {
        await updateService(selectedService.id, serviceData);
      }
      setIsModalOpen(false);
      setSelectedService(null);
    } catch (error) {
      console.error('Error saving service:', error);
    }
  };

  const handleModalDelete = async () => {
    if (selectedService && !selectedService.isNew) {
      try {
        await deleteService(selectedService.id);
        setIsModalOpen(false);
        setSelectedService(null);
      } catch (error) {
        console.error('Error deleting service:', error);
      }
    }
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setSelectedService(null);
  };

  if (error) {
    return (
      <div className={styles.errorContainer}>
        <div className={styles.errorIcon}>⚠️</div>
        <h2>שגיאה בטעינת השירותים</h2>
        <p>{error}</p>
        <button 
          className={styles.retryButton}
          onClick={refreshServices}
        >
          נסה שוב
        </button>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.headerTitle}>
          <h1 className={styles.title}>ניהול שירותים</h1>
          <p className={styles.subtitle}>
            נהל את השירותים שהעסק מציע ללקוחות
          </p>
        </div>

        <button
          className={styles.createButton}
          onClick={handleCreateService}
        >
          + שירות חדש
        </button>
      </div>

      {/* Controls */}
      <div className={styles.controls}>
        {/* Search */}
        <div className={styles.searchContainer}>
          <input
            type="text"
            placeholder="חפש שירותים..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={styles.searchInput}
          />
          <span className={styles.searchIcon}>🔍</span>
        </div>

        {/* Category Filter */}
        <select
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
          className={styles.categoryFilter}
        >
          <option value="all">כל הקטגוריות</option>
          {categories?.map(category => (
            <option key={category} value={category}>
              {category}
            </option>
          ))}
        </select>

        {/* Refresh Button */}
        <button
          className={styles.refreshButton}
          onClick={refreshServices}
          disabled={isLoading}
        >
          {isLoading ? '⏳' : '🔄'}
        </button>
      </div>

      {/* Services Grid */}
      <div className={styles.servicesContainer}>
        {isLoading ? (
          <div className={styles.loadingGrid}>
            {[...Array(6)].map((_, index) => (
              <div key={index} className={styles.serviceSkeleton}>
                <div className={styles.skeletonContent}></div>
              </div>
            ))}
          </div>
        ) : filteredServices.length === 0 ? (
          <div className={styles.emptyState}>
            <div className={styles.emptyIcon}>📋</div>
            <h3 className={styles.emptyTitle}>
              {searchTerm || filterCategory !== 'all' 
                ? 'לא נמצאו שירותים' 
                : 'אין שירותים עדיין'
              }
            </h3>
            <p className={styles.emptyText}>
              {searchTerm || filterCategory !== 'all'
                ? 'נסה לשנות את הפילטרים או מונח החיפוש'
                : 'התחל בהוספת השירות הראשון שלך'
              }
            </p>
            {!searchTerm && filterCategory === 'all' && (
              <button
                className={styles.emptyActionButton}
                onClick={handleCreateService}
              >
                הוסף שירות ראשון
              </button>
            )}
          </div>
        ) : (
          <div className={styles.servicesGrid}>
            {filteredServices.map(service => (
              <div
                key={service.id}
                className={`${styles.serviceCard} ${!service.isActive ? styles.inactive : ''}`}
                onClick={() => handleEditService(service)}
              >
                {/* Service Image */}
                <div className={styles.serviceImage}>
                  {service.imageUrl ? (
                    <img src={service.imageUrl} alt={service.name} />
                  ) : (
                    <div className={styles.placeholderImage}>
                      {service.category === 'מאפיה' ? '🥖' : 
                       service.category === 'יופי' ? '💅' :
                       service.category === 'בריאות' ? '🏥' : '⚙️'}
                    </div>
                  )}
                  
                  {!service.isActive && (
                    <div className={styles.inactiveOverlay}>
                      לא פעיל
                    </div>
                  )}
                </div>

                {/* Service Details */}
                <div className={styles.serviceContent}>
                  <div className={styles.serviceHeader}>
                    <h3 className={styles.serviceName}>{service.name}</h3>
                    <div className={styles.servicePrice}>₪{service.price}</div>
                  </div>

                  <div className={styles.serviceCategory}>
                    {service.category}
                  </div>

                  <p className={styles.serviceDescription}>
                    {service.description}
                  </p>

                  <div className={styles.serviceFooter}>
                    <div className={styles.serviceDuration}>
                      ⏱️ {service.duration} דקות
                    </div>
                    
                    <div className={styles.serviceStats}>
                      <span className={styles.bookingsCount}>
                        📅 {service.bookingsCount || 0} הזמנות
                      </span>
                    </div>
                  </div>
                </div>

                {/* Quick Actions */}
                <div className={styles.serviceActions}>
                  <button
                    className={styles.editButton}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleEditService(service);
                    }}
                    title="ערוך שירות"
                  >
                    ✏️
                  </button>
                  
                  <button
                    className={styles.toggleButton}
                    onClick={(e) => {
                      e.stopPropagation();
                      updateService(service.id, { isActive: !service.isActive });
                    }}
                    title={service.isActive ? 'השבת שירות' : 'הפעל שירות'}
                  >
                    {service.isActive ? '⏸️' : '▶️'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Stats Summary */}
      <div className={styles.statsContainer}>
        <div className={styles.statCard}>
          <div className={styles.statIcon}>📋</div>
          <div className={styles.statContent}>
            <div className={styles.statValue}>
              {services?.length || 0}
            </div>
            <div className={styles.statLabel}>סה"כ שירותים</div>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statIcon}>✅</div>
          <div className={styles.statContent}>
            <div className={styles.statValue}>
              {services?.filter(s => s.isActive).length || 0}
            </div>
            <div className={styles.statLabel}>שירותים פעילים</div>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statIcon}>💰</div>
          <div className={styles.statContent}>
            <div className={styles.statValue}>
              ₪{services?.reduce((sum, s) => s.isActive ? sum + s.price : sum, 0) || 0}
            </div>
            <div className={styles.statLabel}>סה"כ מחירים</div>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statIcon}>📊</div>
          <div className={styles.statContent}>
            <div className={styles.statValue}>
              {categories?.length || 0}
            </div>
            <div className={styles.statLabel}>קטגוריות</div>
          </div>
        </div>
      </div>

      {/* Service Modal */}
      {isModalOpen && (
        <ServiceModal
          service={selectedService}
          businessId={businessId}
          categories={categories}
          onSave={handleModalSave}
          onDelete={handleModalDelete}
          onClose={handleModalClose}
        />
      )}
    </div>
  );
}