import { ArrowRight } from 'lucide-react'
import { Link } from 'react-router'
import { services } from '../../../shared/data/services'

export function HeroPipelineVisual() {
  return (
    <div className="hero-services-panel" aria-labelledby="hero-services-title">
      <div className="hero-services-heading">
        <p>LeadHive channels</p>
        <h2 id="hero-services-title">Choose a service</h2>
        <span>Select a channel to explore its current experience.</span>
      </div>
      <div className="hero-services-list">
        {services.map((service) => {
          const content = (
            <>
              <span className={`hero-service-icon ${service.iconClass}`}>{service.icon}</span>
              <span className="hero-service-copy">
                <strong>{service.name}</strong>
                <small>{service.description}</small>
              </span>
              {service.available ? (
                <ArrowRight className="hero-service-arrow" size={18} aria-hidden="true" />
              ) : (
                <span className="hero-service-status">Coming soon</span>
              )}
            </>
          )
          const className = `hero-service-card${service.available ? ' is-available' : ''}`

          return service.available ? (
            <Link key={service.name} to={service.href} className={className}>
              {content}
            </Link>
          ) : (
            <div key={service.name} className={className} aria-disabled="true">
              {content}
            </div>
          )
        })}
      </div>
    </div>
  )
}